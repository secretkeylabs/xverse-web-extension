import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactNode, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import ActionButton from '@components/button';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import { useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
import { signBtcTransaction } from '@secretkeylabs/xverse-core/transactions';
import { useMutation } from '@tanstack/react-query';
import { SignedBtcTxResponse } from '@secretkeylabs/xverse-core/transactions/btc';
import TransferAmountView from '@components/transferAmountView';
import TransferFeeView from '@components/transferFeeView';
import { ErrorCodes, ResponseError } from '@secretkeylabs/xverse-core';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(11),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(5),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(10),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(24),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
}));

interface Props {
  fee: BigNumber;
  children: ReactNode;
  loadingBroadcastedTx: boolean;
  amount: BigNumber;
  recipientAddress: string;
  signedTxHex: string;
  onConfirmClick: (signedTxHex: string) => void;
  onCancelClick: () => void;
  onBackButtonClick: () => void;
}

function ConfirmBtcTransactionComponent({
  fee,
  children,
  loadingBroadcastedTx,
  amount,
  recipientAddress,
  signedTxHex,
  onConfirmClick,
  onCancelClick,
  onBackButtonClick,
}: Props) {
  const { t } = useTranslation('translation');
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const {
    btcAddress, selectedAccount, seedPhrase, network,
  } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const [currentFee, setCurrentFee] = useState(fee);
  const [error, setError] = useState('');
  const [signedTx, setSignedTx] = useState(signedTxHex);
  const {
    isLoading, data, error: txError, mutate,
  } = useMutation<
  SignedBtcTxResponse,
  ResponseError,
  {
    address: string;
    amountToSend: string;
    txFee: string;
  }
  >(
    async ({ address, amountToSend, txFee }) => signBtcTransaction({
      recipientAddress: address,
      btcAddress,
      amount: amountToSend,
      index: selectedAccount?.id ?? 0,
      fee: new BigNumber(txFee),
      seedPhrase,
      network: network.type,
    }),
  );

  useEffect(() => {
    if (data) {
      setCurrentFee(data.fee);
      setSignedTx(data.signedTx);
    }
  }, [data]);

  const onAdvancedSettingClick = () => {
    setOpenTransactionSettingModal(true);
  };

  const closeTransactionSettingAlert = () => {
    setOpenTransactionSettingModal(false);
  };

  const onApplyClick = (modifiedFee: string) => {
    setOpenTransactionSettingModal(false);
    setCurrentFee(new BigNumber(modifiedFee));
    mutate({ address: recipientAddress, amountToSend: amount.toString(), txFee: modifiedFee });
  };

  const handleOnConfirmClick = () => {
    onConfirmClick(signedTx);
  };

  useEffect(() => {
    if (recipientAddress && amount && txError) {
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(txError.toString());
    }
  }, [txError]);

  return (
    <>
      <TopRow title={t('CONFIRM_TRANSACTION.SEND')} onClick={onBackButtonClick} />
      <Container>
        <TransferAmountView currency="BTC" amount={amount} />
        {children}
        <TransferFeeView fee={currentFee} currency={t('SATS')} />
        <Button onClick={onAdvancedSettingClick}>
          <>
            <ButtonImage src={SettingIcon} />
            <ButtonText>{t('CONFIRM_TRANSACTION.EDIT_FEES')}</ButtonText>
          </>
        </Button>
        <TransactionSettingAlert
          visible={openTransactionSettingModal}
          fee={currentFee.toString()}
          type="BTC"
          amount={amount}
          onApplyClick={onApplyClick}
          onCrossClick={closeTransactionSettingAlert}
          btcRecepientAddress={recipientAddress}
        />
      </Container>
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
      </ErrorContainer>
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton
            text={t('CONFIRM_TRANSACTION.CANCEL')}
            transparent
            onPress={onCancelClick}
            disabled={loadingBroadcastedTx || isLoading}
          />
        </TransparentButtonContainer>
        <ActionButton
          text={t('CONFIRM_TRANSACTION.CONFIRM')}
          disabled={loadingBroadcastedTx || isLoading}
          processing={loadingBroadcastedTx || isLoading}
          onPress={handleOnConfirmClick}
        />
      </ButtonContainer>
    </>
  );
}

export default ConfirmBtcTransactionComponent;
