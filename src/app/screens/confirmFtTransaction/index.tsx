import type { ConfirmStxTransactionState, LedgerTransactionType } from '@common/types/ledger';
import ConfirmStxTransactionComponent from '@components/confirmStxTransactionComponent';
import TransferMemoView from '@components/confirmStxTransactionComponent/transferMemoView';
import RecipientComponent from '@components/recipientComponent';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  AnalyticsEvents,
  broadcastSignedTransaction,
  microstacksToStx,
  stxToMicrostacks,
  type StacksTransaction,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import { isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

function ConfirmFtTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const selectedNetwork = useNetworkSelector();
  const location = useLocation();
  const {
    unsignedTx: unsignedTxHex,
    amount,
    fungibleToken,
    memo,
    recipientAddress,
    selectedFee,
  } = location.state;
  const [fee, setFee] = useState(BigNumber(selectedFee));
  const unsignedTx = useMemo(() => deserializeTransaction(unsignedTxHex), [unsignedTxHex]);
  const { refetch } = useStxWalletData();
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();

  const {
    isLoading,
    error: txError,
    data: stxTxBroadcastData,
    mutate,
  } = useMutation<string, Error, { signedTx: StacksTransaction }>({
    mutationFn: async ({ signedTx }) => broadcastSignedTransaction(signedTx, selectedNetwork),
  });

  useEffect(() => {
    if (stxTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: stxTxBroadcastData,
          currency: 'STX',
          error: '',
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [stxTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: txError.toString(),
        },
      });
    }
  }, [txError]);

  const handleOnConfirmClick = (txs: StacksTransaction[]) => {
    if (isLedgerAccount(selectedAccount)) {
      const type: LedgerTransactionType = 'STX';
      const state: ConfirmStxTransactionState = {
        unsignedTx: Buffer.from(unsignedTx.serialize()),
        type,
        recipients: [{ address: recipientAddress, amountMicrostacks: new BigNumber(amount) }],
        fee: new BigNumber(unsignedTx.auth.spendingCondition.fee.toString()),
      };

      navigate('/confirm-ledger-tx', { state });
      return;
    }

    trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
      protocol: 'sip10',
      action: 'transfer',
      wallet_type: selectedAccount?.accountType || 'software',
    });

    mutate({ signedTx: txs[0] });
  };

  const handleCancelClick = () => {
    navigate(`/coinDashboard/FT?ftKey=${fungibleToken?.principal}&protocol=stacks`);
  };

  const handleBackButtonClick = () => {
    navigate(`/send-stx?principal=${fungibleToken?.principal}`, {
      state: {
        recipientAddress,
        amountToSend: amount.toString(),
        stxMemo: memo,
      },
    });
  };

  return (
    <>
      <TopRow title={t('CONFIRM_TX')} onClick={handleBackButtonClick} />
      <ConfirmStxTransactionComponent
        initialStxTransactions={[unsignedTx]}
        loading={isLoading}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={handleCancelClick}
        skipModal={isLedgerAccount(selectedAccount)}
        fee={fee ? microstacksToStx(fee).toString() : undefined}
        setFeeRate={(feeRate: string) => {
          setFee(stxToMicrostacks(new BigNumber(feeRate)));
        }}
      >
        <RecipientComponent
          address={recipientAddress}
          value={`${amount}`}
          fungibleToken={fungibleToken}
          title={t('AMOUNT')}
          currencyType="FT"
        />
        <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
        {memo && <TransferMemoView memo={memo} />}
      </ConfirmStxTransactionComponent>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default ConfirmFtTransaction;
