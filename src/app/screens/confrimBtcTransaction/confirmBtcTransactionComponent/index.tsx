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
  marginBottom: props.theme.spacing(8),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(5),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
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
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const {
    btcAddress,
    selectedAccount,
    seedPhrase,
    network,
  } = useSelector((state: StoreState) => state.walletState);
  const [currentFee, setCurrentFee] = useState(fee);
  const [signedTx, setSignedTx] = useState(signedTxHex);
  const {
    isLoading,
    data,
    mutate,
  } = useMutation<
  SignedBtcTxResponse,
  Error,
  {
    address: string;
    amountToSend: string;
    txFee : string;
  }
  >(async ({ address, amountToSend, txFee }) => signBtcTransaction({
    recipientAddress: address,
    btcAddress,
    amount: amountToSend,
    index: selectedAccount?.id ?? 0,
    fee: new BigNumber(txFee),
    seedPhrase,
    network: network.type,
  }));

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

  return (
    <>
      <TopRow title={t('SEND')} onClick={onBackButtonClick} />
      <Container>
        <TransferAmountView currency="BTC" amount={amount} />
        {children}
        <TransferFeeView fee={currentFee} currency={t('SATS')} />
        <Button onClick={onAdvancedSettingClick}>
          <>
            <ButtonImage src={SettingIcon} />
            <ButtonText>{t('EDIT_FEES')}</ButtonText>
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
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton
            text={t('CANCEL')}
            transparent
            onPress={onCancelClick}
            disabled={loadingBroadcastedTx || isLoading}
          />
        </TransparentButtonContainer>
        <ActionButton
          text={t('CONFIRM')}
          disabled={loadingBroadcastedTx || isLoading}
          processing={loadingBroadcastedTx || isLoading}
          onPress={handleOnConfirmClick}
        />
      </ButtonContainer>
    </>
  );
}

export default ConfirmBtcTransactionComponent;
