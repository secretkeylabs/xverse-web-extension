import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core/types';
import BottomBar from '@components/tabBar';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useWalletSelector from '@hooks/useWalletSelector';
import ConfirmBtcTransactionComponent from '@components/confirmBtcTransactionComponent';
import styled from 'styled-components';
import { saveTimeForNonOrdinalTransferTransaction } from '@utils/localStorage';
import useBtcClient from '@hooks/useBtcClient';

const BottomBarContainer = styled.h1((props) => ({
  marginTop: props.theme.spacing(5),
}));

function ConfirmBtcTransaction() {
  const navigate = useNavigate();
  const btcClient = useBtcClient();
  const { ordinalsAddress } = useWalletSelector();
  const [recipientAddress, setRecipientAddress] = useState('');
  const location = useLocation();
  const { refetch } = useBtcWalletData();
  const {
    fee, amount, signedTxHex, recipient, isRestoreFundFlow, unspentUtxos,
  } = location.state;

  const {
    isLoading,
    error: txError,
    data: btcTxBroadcastData,
    mutate,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>(
    async ({ signedTx }) => btcClient.sendRawTransaction(signedTx),
  );

  const {
    error: errorBtcOrdinalTransaction,
    data: btcOrdinalTxBroadcastData,
    mutate: broadcastOrdinalTransaction,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>(
    async ({ signedTx }) => btcClient.sendRawTransaction(signedTx),
  );

  useEffect(() => {
    if (errorBtcOrdinalTransaction) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          isNft: true,
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
        refetch();
      }, 1000);
    }
  }, [btcTxBroadcastData]);

  useEffect(() => {
    if (btcOrdinalTxBroadcastData) {
      saveTimeForNonOrdinalTransferTransaction(ordinalsAddress).then(() => {
        navigate('/tx-status', {
          state: {
            txid: btcOrdinalTxBroadcastData.tx.hash,
            currency: 'BTC',
            isNft: true,
            error: '',
          },
        });
        setTimeout(() => {
          refetch();
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
        isRestoreFundFlow={isRestoreFundFlow}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={goBackToScreen}
        onBackButtonClick={goBackToScreen}
        nonOrdinalUtxos={unspentUtxos}
      />
      <BottomBarContainer>
        <BottomBar tab="dashboard" />
      </BottomBarContainer>
    </>
  );
}

export default ConfirmBtcTransaction;
