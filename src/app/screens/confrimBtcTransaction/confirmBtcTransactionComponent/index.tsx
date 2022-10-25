import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { NumericFormat } from 'react-number-format';
import { ReactNode, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import ActionButton from '@components/button';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import Theme from 'theme';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core/currency';
import { useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
import { signBtcTransaction } from '@secretkeylabs/xverse-core/transactions';
import { useMutation } from '@tanstack/react-query';
import { SignedBtcTxResponse } from '@secretkeylabs/xverse-core/transactions/btc';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(11),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(6),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(6),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const FeeText = styled.h1((props) => ({
  ...props.theme.body_m,
}));

const FeeTitleContainer = styled.div({
  display: 'flex',
  flex: 1,
});

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const SendAmountContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const AmountText = styled.h1((props) => ({
  ...props.theme.headline_category_m,
  textTransform: 'uppercase',
  fontSize: 28,
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
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
    btcFiatRate,
    fiatCurrency,
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
    network,
  }));

  useEffect(() => {
    if (data) {
      setCurrentFee(data.fee);
      setSignedTx(data.signedTx);
    }
  }, [data]);

  const getFiatAmountString = (fiatAmount: BigNumber) => {
    if (fiatAmount) {
      if (fiatAmount.isLessThan(0.01)) {
        return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
      }
      return (
        <NumericFormat
          value={fiatAmount.toFixed(2).toString()}
          displayType="text"
          thousandSeparator
          prefix={`${currencySymbolMap[fiatCurrency]} `}
          suffix={` ${fiatCurrency}`}
          renderText={(value: string) => <FiatAmountText>{value}</FiatAmountText>}
        />
      );
    }
    return '';
  };

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

  const amountComponent = (
    <SendAmountContainer>
      <TitleText>{t('INDICATION')}</TitleText>
      <NumericFormat
        value={Number(amount)}
        displayType="text"
        thousandSeparator
        suffix=" BTC"
        renderText={(value) => <AmountText>{value}</AmountText>}
      />
    </SendAmountContainer>
  );

  const feeComponent = (
    <RowContainer>
      <FeeTitleContainer>
        <TitleText>{t('FEES')}</TitleText>
      </FeeTitleContainer>
      <FeeContainer>
        <FeeText>{`${currentFee} ${t('SATS')}`}</FeeText>
        <FiatAmountText>
          {getFiatAmountString(getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate))}
        </FiatAmountText>
      </FeeContainer>
    </RowContainer>
  );

  const handleOnConfirmClick = () => {
    onConfirmClick(signedTx);
  };

  return (
    <>
      <TopRow title={t('SEND')} onClick={onBackButtonClick} />
      <Container>
        {amountComponent}
        {children}
        {feeComponent}
        <ActionButton
          src={SettingIcon}
          text={t('EDIT_FEES')}
          buttonColor="transparent"
          buttonAlignment="flex-start"
          onPress={onAdvancedSettingClick}
        />
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
        <ActionButton
          text={t('CANCEL')}
          buttonColor="transparent"
          buttonBorderColor={Theme.colors.background.elevation2}
          onPress={onCancelClick}
          margin={3}
          disabled={loadingBroadcastedTx || isLoading}
        />
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
