import { makeRPCError, sendRpcResponse } from '@common/utils/rpc/helpers';
import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useHasFeature from '@hooks/useHasFeature';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { RpcErrorCode } from '@sats-connect/core';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import {
  AnalyticsEvents,
  btcTransaction,
  FeatureId,
  parseSummaryForRunes,
  type RuneSummary,
  type Transport,
} from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useBtcSendRequestPayload from './useBtcSendRequestPayload';

const OuterContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

function BtcSendRequest() {
  const { network } = useWalletSelector();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { payload, tabId, requestId } = useBtcSendRequestPayload(
    selectedAccount.btcAddress,
    network,
  );
  const transactionContext = useTransactionContext();
  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();
  const { t } = useTranslation('translation');
  const [feeRate, setFeeRate] = useState('');
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();
  const [runeSummary, setRuneSummary] = useState<RuneSummary | undefined>();
  const hasRunesSupport = useHasFeature(FeatureId.RUNES_SUPPORT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateTx = (desiredFeeRate: number): Promise<btcTransaction.EnhancedTransaction> =>
    btcTransaction.sendBtc(
      transactionContext,
      payload.recipients.map((value) => ({
        toAddress: value.address,
        amount: BigInt(value.amountSats.toString()),
      })),
      +desiredFeeRate,
    );

  useEffect(() => {
    if (!feeRate && btcFeeRate && !feeRatesLoading) {
      setFeeRate(btcFeeRate.regular.toString());
    }
  }, [btcFeeRate, feeRatesLoading]);

  useEffect(() => {
    if (!payload || !transactionContext || !feeRate) {
      setSummary(undefined);
      setRuneSummary(undefined);
      return;
    }
    const generateTxnAndSummary = async () => {
      try {
        setIsLoading(true);
        const newTransaction = await generateTx(+feeRate);
        const newSummary = await newTransaction.getSummary();
        setTransaction(newTransaction);
        setSummary(newSummary);
        if (newSummary && hasRunesSupport) {
          setRuneSummary(
            await parseSummaryForRunes(transactionContext, newSummary, transactionContext.network, {
              separateTransfersOnNoExternalInputs: true,
            }),
          );
        }
      } catch (e) {
        setTransaction(undefined);
        setSummary(undefined);
        let error;
        let errorTitle;
        if (e instanceof Error && e.message.includes('Insufficient funds')) {
          const errorResponse = makeRPCError(requestId, {
            code: RpcErrorCode.INTERNAL_ERROR,
            message: 'Insufficient balance',
          });
          errorTitle = t('ERRORS.INVALID_TRANSACTION');
          error = t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES');
          sendRpcResponse(+tabId, errorResponse);
        }
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle,
            error,
            browserTx: true,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };
    generateTxnAndSummary();
  }, [transactionContext, payload, feeRate]);

  useEffect(() => {
    const checkIfMismatch = () => {
      if (payload.senderAddress !== selectedAccount.btcAddress) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'STX',
            error: t('CONFIRM_TRANSACTION.ADDRESS_MISMATCH'),
            browserTx: true,
          },
        });
      }
      if (payload.network.type !== network.type) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            error: t('CONFIRM_TRANSACTION.NETWORK_MISMATCH'),
            browserTx: true,
          },
        });
      }
    };

    checkIfMismatch();
  }, [payload]);

  useEffect(() => {
    const checkIfValidAmount = () => {
      payload.recipients.forEach((txRecipient) => {
        if (txRecipient.amountSats < BITCOIN_DUST_AMOUNT_SATS) {
          navigate('/tx-status', {
            state: {
              txid: '',
              currency: 'BTC',
              error: t('SEND.ERRORS.BELOW_MINIMUM_AMOUNT'),
              browserTx: true,
            },
          });
        }
      });
    };
    checkIfValidAmount();
  }, [payload]);

  const handleSubmit = async (ledgerTransport?: Transport) => {
    try {
      setIsSubmitting(true);
      const txnId = await transaction?.broadcast({ ledgerTransport, rbfEnabled: true });
      trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
        protocol: 'bitcoin',
        action: 'transfer',
        wallet_type: selectedAccount.accountType || 'software',
      });
      navigate('/tx-status', {
        state: {
          txid: txnId,
          currency: 'BTC',
          error: '',
          browserTx: true,
        },
      });
    } catch (e) {
      console.error(e);
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: `${e}`,
          browserTx: true,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const tempTx = await generateTx(desiredFeeRate);
    const tempSummary = await tempTx.getSummary();
    if (tempSummary) return Number(tempSummary.fee);
    return undefined;
  };

  if (feeRatesLoading || !payload || !summary) {
    return <OuterContainer>{isLoading && <Spinner color="white" size={50} />}</OuterContainer>;
  }

  return (
    <ConfirmBtcTransaction
      summary={summary}
      runeSummary={runeSummary}
      isLoading={isLoading}
      confirmText={t('COMMON.CONFIRM')}
      cancelText={t('COMMON.CANCEL')}
      onCancel={() => window.close()}
      onConfirm={handleSubmit}
      getFeeForFeeRate={calculateFeeForFeeRate}
      onFeeRateSet={(newFeeRate) => setFeeRate(newFeeRate.toString())}
      feeRate={+feeRate}
      isSubmitting={isSubmitting}
      isBroadcast
      hideBottomBar
    />
  );
}

export default BtcSendRequest;
