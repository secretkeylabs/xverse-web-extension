import ConfirmBtcTransactionComponent from '@screens/confrimBtcTransaction/confirmBtcTransactionComponent';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ArrowSquareOut from '@assets/img/send/arrow_square_out.svg';
import Seperator from '@components/seperator';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
import { useEffect, useState } from 'react';
import { broadcastRawBtcTransaction } from '@secretkeylabs/xverse-core/api';
import { useMutation } from '@tanstack/react-query';
import { fetchBtcWalletDataRequestAction } from '@stores/wallet/actions/actionCreators';
import BottomBar from '@components/tabBar';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core/types';

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

const AddressContainer = styled.div({
  display: 'flex',
  flex: 1,
});

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

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const ActionButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  marginLeft: props.theme.spacing(12),
}));

function ConfirmBtcTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    network,
    btcAddress, stxBtcRate, btcFiatRate,
  } = useSelector((state: StoreState) => state.walletState);
  const [recipientAddress, setRecipientAddress] = useState('');
  const location = useLocation();
  const { fee, amount, signedTxHex } = location.state;

  const {
    isLoading,
    error: txError,
    data: btcTxBroadcastData,
    mutate,
  } = useMutation<
  BtcTransactionBroadcastResponse,
  Error,
  { signedTx: string }>(async ({ signedTx }) => broadcastRawBtcTransaction(signedTx, network));

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
        dispatch(fetchBtcWalletDataRequestAction(btcAddress, network, stxBtcRate, btcFiatRate));
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

  function renderAddressInfoSection() {
    return (
      <InfoContainer>
        <TitleText>{t('RECEPIENT_ADDRESS')}</TitleText>
        <RowContainer>
          <AddressContainer>
            <ValueText>{recipientAddress}</ValueText>
          </AddressContainer>
          <ActionButton>
            <ButtonImage src={ArrowSquareOut} />
          </ActionButton>
        </RowContainer>
      </InfoContainer>
    );
  }

  function renderNetworkInfoSection() {
    return (
      <InfoContainer>
        <TitleText>{t('NETWORK')}</TitleText>
        <ValueText>{network}</ValueText>
      </InfoContainer>
    );
  }

  const handleOnConfirmClick = (txHex: string) => {
    mutate({ signedTx: txHex });
  };

  const goBackToScreen = () => {
    navigate('/send-btc');
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
        {renderAddressInfoSection()}
        {renderNetworkInfoSection()}
        <Seperator />
      </ConfirmBtcTransactionComponent>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default ConfirmBtcTransaction;
