import useWalletSelector from '@hooks/useWalletSelector';
import { ErrorCodes, getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useSendBtcRequest from './useSendBtcRequest';

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

function BtcSendScreen() {
  const { payload, signedTx, isLoading, tabId, requestToken, requestId, error, recipient } =
    useSendBtcRequest();
  const navigate = useNavigate();
  const { btcFiatRate, btcAddress, network } = useWalletSelector();
  const { t } = useTranslation('translation');

  useEffect(() => {
    const checkIfMismatch = () => {
      if (payload.senderAddress !== btcAddress) {
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
      recipient.forEach((txRecipient) => {
        if (txRecipient.amountSats.lt(BITCOIN_DUST_AMOUNT_SATS)) {
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
  }, [recipient]);

  useEffect(() => {
    if (error) {
      if (
        Number(error) === ErrorCodes.InSufficientBalanceWithTxFee ||
        Number(error) === ErrorCodes.InSufficientBalance
      ) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: t('TX_ERRORS.INVALID_TRANSACTION'),
            error: t('TX_ERRORS.INSUFFICIENT_BALANCE'),
            browserTx: true,
          },
        });
      } else {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            error,
            browserTx: true,
          },
        });
      }
    }
  }, [error]);

  useEffect(() => {
    if (signedTx) {
      navigate('/confirm-btc-tx', {
        state: {
          signedTxHex: signedTx.signedTx,
          recipient,
          fee: signedTx.fee,
          feePerVByte: signedTx.feePerVByte,
          fiatFee: getBtcFiatEquivalent(signedTx.fee, BigNumber(btcFiatRate)),
          total: signedTx.total,
          fiatTotal: getBtcFiatEquivalent(signedTx.total, BigNumber(btcFiatRate)),
          btcSendBrowserTx: true,
          requestToken,
          tabId,
          requestId,
        },
      });
    }
  }, [signedTx]);

  return <OuterContainer>{isLoading && <Spinner color="white" size={50} />}</OuterContainer>;
}

export default BtcSendScreen;
