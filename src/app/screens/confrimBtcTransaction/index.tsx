import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { broadcastRawBtcOrdinalTransaction, broadcastRawBtcTransaction } from '@secretkeylabs/xverse-core/api';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core/types';
import { fetchBtcWalletDataRequestAction } from '@stores/wallet/actions/actionCreators';
import { StoreState } from '@stores/index';
import BottomBar from '@components/tabBar';
import ConfirmBtcTransactionComponent from '@components/confirmBtcTransactionComponent';
import styled from 'styled-components';
import { saveTimeForNonOrdinalTransferTransaction } from '@utils/localStorage';

const BottomBarContainer = styled.h1((props) => ({
  marginTop: props.theme.spacing(5),
}));

function ConfirmBtcTransaction() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    network, btcAddress, stxBtcRate, btcFiatRate, ordinalsAddress,
  } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const [recipientAddress, setRecipientAddress] = useState('');
  const location = useLocation();
  const {
    fee, amount, signedTxHex, recipient, isRestoreFundFlow,
  } = location.state;
  const {
    isLoading,
    error: txError,
    data: btcTxBroadcastData,
    mutate,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>(
    async ({ signedTx }) => broadcastRawBtcTransaction(signedTx, network.type),
  );

  const {
    error: errorBtcOrdinalTransaction,
    data: btcOrdinalTxBroadcastData,
    mutate: broadcastOrdinalTransaction,
  } = useMutation<string, Error, { signedTx: string }>(
    async ({ signedTx }) => broadcastRawBtcOrdinalTransaction(
      signedTx,
      network.type,
    ),
  );

  useEffect(() => {
    if (errorBtcOrdinalTransaction) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: errorBtcOrdinalTransaction.toString(),
        },
      });
    }
  }, [errorBtcOrdinalTransaction]);

  useEffect(() => {
    setRecipientAddress(location.state.recipientAddress);
  }, [location]);

  useEffect(() => {
    if (btcTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: btcTxBroadcastData.tx.hash,
          currency: 'BTC',
          error: '',
        },
      });
      setTimeout(() => {
        dispatch(fetchBtcWalletDataRequestAction(btcAddress, network.type, stxBtcRate, btcFiatRate));
      }, 1000);
    }
  }, [btcTxBroadcastData]);

  useEffect(() => {
    if (btcOrdinalTxBroadcastData) {
      saveTimeForNonOrdinalTransferTransaction(ordinalsAddress).then(() => {
        navigate('/tx-status', {
          state: {
            txid: btcOrdinalTxBroadcastData,
            currency: 'BTC',
            error: '',
          },
        });
        setTimeout(() => {
          dispatch(fetchBtcWalletDataRequestAction(btcAddress, network.type, stxBtcRate, btcFiatRate));
        }, 1000);
      });
    }
  }, [btcOrdinalTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: txError.toString(),
        },
      });
    }
  }, [txError]);

  const handleOnConfirmClick = (txHex: string) => {
    if (isRestoreFundFlow) {
      broadcastOrdinalTransaction({ signedTx: txHex });
    } else {
      mutate({ signedTx: txHex });
    }
  };

  const goBackToScreen = () => {
    if (isRestoreFundFlow) {
      navigate(-1);
    } else {
      navigate('/send-btc', {
        state: {
          amount,
          recipientAddress,
        },
      });
    }
  };
  return (
    <>
      <ConfirmBtcTransactionComponent
        fee={fee}
        recipients={recipient}
        loadingBroadcastedTx={isLoading}
        signedTxHex={signedTxHex}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={goBackToScreen}
        onBackButtonClick={goBackToScreen}
      />
      <BottomBarContainer>
        <BottomBar tab="dashboard" />
      </BottomBarContainer>

    </>
  );
}

export default ConfirmBtcTransaction;
