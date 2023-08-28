import ActionButton from '@components/button';
import BigNumber from 'bignumber.js';
import Brc20FeesComponent from '@screens/confirmBrc20Transaction/brc20FeesComponent';
import RecipientComponent from '@components/recipientComponent';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import styled from 'styled-components';
import useWalletSelector from '@hooks/useWalletSelector';
import { NumericFormat } from 'react-number-format';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import { FungibleToken, getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditFees, OnChangeFeeRate } from './editFees';

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(16),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(8),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: props.theme.spacing(8),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(12),
}));

const EditFeesButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  marginTop: props.theme.spacing(12),
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
  marginTop: props.theme.spacing(8),
}));

const ErrorText = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(16),
  textAlign: 'left',
}));

function ConfirmBtcTransactionComponent({
  btcFee,
  currentFeeRate,
  inscriptionFee,
  onClickApplyFee,
  onChangeFee,
  onClickCancel,
  onClickConfirm,
  recipients,
  token,
  totalFee,
  transactionFee,
  isFeeLoading,
  error,
}: {
  btcFee: BigNumber;
  currentFeeRate: number;
  inscriptionFee: BigNumber;
  onClickApplyFee: OnChangeFeeRate;
  onChangeFee: OnChangeFeeRate;
  onClickCancel: () => void;
  onClickConfirm: () => void;
  recipients: Recipient[];
  token: FungibleToken;
  totalFee: BigNumber;
  transactionFee: BigNumber;
  isFeeLoading: boolean;
  error: string;
}) {
  /* hooks */
  const { t } = useTranslation('translation');
  const { network, btcFiatRate, fiatCurrency } = useWalletSelector();

  /* state */
  const [isLoading, setIsLoading] = useState(false);
  const [showFeeSettings, setShowFeeSettings] = useState(false);

  /* callbacks */
  const handleClickAdvancedSetting = () => {
    setShowFeeSettings(true);
  };

  const handleClickCloseFees = () => {
    setShowFeeSettings(false);
  };

  const handleClickConfirm = () => {
    setIsLoading(true);
    onClickConfirm();
    setIsLoading(false);
  };

  const handleClickCancel = () => {
    onClickCancel();
  };

  const fees = [
    {
      label: 'Transaction Fee',
      value: transactionFee,
      suffix: 'sats',
    },
    {
      label: 'Inscription Fee',
      value: inscriptionFee,
      suffix: 'sats',
    },
    {
      label: 'Total Fee',
      value: totalFee,
      suffix: 'sats',
      fiatValue: getBtcFiatEquivalent(totalFee, btcFiatRate),
      fiatCurrency,
    },
  ];
  const errorMessage = error ? t(`CONFIRM_BRC20.ERROR_CODES.${error}`) : '';

  return (
    <>
      <OuterContainer>
        <Container>
          <ReviewTransactionText>
            {t('CONFIRM_TRANSACTION.REVIEW_TRANSACTION')}
          </ReviewTransactionText>
          {recipients?.map(({ address, amountSats }, index) => (
            <RecipientComponent
              key={address}
              address={address}
              recipientIndex={index + 1}
              value={amountSats.toString()}
              totalRecipient={recipients.length}
              currencyType="FT"
              fungibleToken={token}
              title={t('CONFIRM_TRANSACTION.AMOUNT')}
              showSenderAddress={false}
            />
          ))}
          <TransactionDetailComponent
            title={t('CONFIRM_TRANSACTION.NETWORK')}
            value={network.type}
          />
          <TransactionDetailComponent
            title={t('CONFIRM_BRC20.BITCOIN_VALUE')}
            value={
              <NumericFormat
                value={btcFee.toString()}
                displayType="text"
                thousandSeparator
                suffix={` sats`}
              />
            }
          />
          <Brc20FeesComponent fees={fees} />
          <div>
            <EditFeesButton onClick={handleClickAdvancedSetting}>
              <ButtonImage src={SettingIcon} />
              <ButtonText>{t('CONFIRM_TRANSACTION.EDIT_FEES')}</ButtonText>
            </EditFeesButton>
          </div>
          {errorMessage && (
            <ErrorContainer>
              <ErrorText>{errorMessage}</ErrorText>
            </ErrorContainer>
          )}
        </Container>
      </OuterContainer>
      <ButtonContainer>
        <ActionButton
          text={t('CONFIRM_TRANSACTION.CANCEL')}
          transparent
          onPress={handleClickCancel}
          disabled={isLoading}
        />
        <ActionButton
          text={t('CONFIRM_TRANSACTION.CONFIRM')}
          disabled={isLoading}
          processing={isLoading}
          onPress={handleClickConfirm}
        />
      </ButtonContainer>
      <EditFees
        visible={showFeeSettings}
        onClose={handleClickCloseFees}
        fee={transactionFee.toString()}
        initialFeeRate={currentFeeRate}
        onClickApply={onClickApplyFee}
        onChangeFeeRate={onChangeFee}
        isFeeLoading={isFeeLoading}
        error={errorMessage}
      />
    </>
  );
}

export default ConfirmBtcTransactionComponent;
