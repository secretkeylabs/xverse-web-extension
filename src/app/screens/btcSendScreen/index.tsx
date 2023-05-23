import useSendBtcRequest from '@hooks/useSendBtcRequest';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  getBtcFiatEquivalent,
} from '@secretkeylabs/xverse-core';
import { BITCOIN_DUST_AMOUNT_SATS } from '@utils/constants';
import BigNumber from 'bignumber.js';
import {
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

const OuterContainer = styled.div`
  display: flex;
  flex:1 ;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

function BtcSendScreen() {
  const {
    payload,
    signedTx,
    isLoading,
    tabId,
    requestToken,
    error,
  } = useSendBtcRequest();
  const navigate = useNavigate();
  const {
    btcFiatRate,
    network,
  } = useWalletSelector();
  const { t } = useTranslation('translation');

  const checkIfMismatch = () => {
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
    if (new BigNumber(payload?.satsAmount).lt(BITCOIN_DUST_AMOUNT_SATS)) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: t('SEND.ERRORS.BELOW_MINIMUM_AMOUNT'),
          browserTx: true,
        },
      });
    }
  };

  useEffect(() => {
    checkIfMismatch();
  }, []);

  useEffect(() => {
    if (error) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error,
          browserTx: true,
        },
      });
    }
  }, [error]);

  useEffect(() => {
    if (signedTx) {
      const parsedAmountSats = new BigNumber(payload.satsAmount);
      navigate('/confirm-btc-tx', {
        state: {
          signedTxHex: signedTx.signedTx,
          recipientAddress: payload.recipientAddress,
          amount: payload.satsAmount,
          recipient: [
            {
              address: payload?.recipientAddress,
              amountSats: new BigNumber(payload?.satsAmount),
            },
          ],
          fiatAmount: getBtcFiatEquivalent(parsedAmountSats, btcFiatRate),
          fee: signedTx.fee,
          fiatFee: getBtcFiatEquivalent(signedTx.fee, btcFiatRate),
          total: signedTx.total,
          fiatTotal: getBtcFiatEquivalent(signedTx.total, btcFiatRate),
          btcSendBrowserTx: true,
          requestToken,
          tabId,
        },
      });
    }
  }, [signedTx]);
  return (
    <OuterContainer>
      { isLoading && <MoonLoader color="white" size={50} />}
    </OuterContainer>
  );
}

export default BtcSendScreen;
