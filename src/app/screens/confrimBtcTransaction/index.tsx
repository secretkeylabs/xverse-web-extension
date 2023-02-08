import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { broadcastRawBtcTransaction } from '@secretkeylabs/xverse-core/api';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core/types';
import Seperator from '@components/seperator';
import BottomBar from '@components/tabBar';
import RecipientAddressView from '@components/recipinetAddressView';
import ConfirmBtcTransactionComponent from '@screens/confrimBtcTransaction/confirmBtcTransactionComponent';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useWalletSelector from '@hooks/useWalletSelector';

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(4),
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(2),
  wordBreak: 'break-all',
}));

function ConfirmBtcTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const { network } = useWalletSelector();
  const [recipientAddress, setRecipientAddress] = useState('');
  const location = useLocation();
  const { refetch } = useBtcWalletData();
  const { fee, amount, signedTxHex } = location.state;

  const {
    isLoading,
    error: txError,
    data: btcTxBroadcastData,
    mutate,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>(
    async ({ signedTx }) => broadcastRawBtcTransaction(signedTx, network.type),
  );

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
    mutate({ signedTx: txHex });
  };

  const goBackToScreen = () => {
    navigate('/send-btc', {
      state: {
        amount,
        recipientAddress,
      },
    });
  };
  return (
    <>
      <ConfirmBtcTransactionComponent
        fee={fee}
        amount={amount}
        recipientAddress={recipientAddress}
        loadingBroadcastedTx={isLoading}
        signedTxHex={signedTxHex}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={goBackToScreen}
        onBackButtonClick={goBackToScreen}
      >
        <RecipientAddressView recipient={recipientAddress} />
        <InfoContainer>
          <TitleText>{t('NETWORK')}</TitleText>
          <ValueText>{network.type}</ValueText>
        </InfoContainer>
        <Seperator />
      </ConfirmBtcTransactionComponent>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default ConfirmBtcTransaction;
