import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import ActionButton from '@components/button';
import RecipientComponent from '@components/recipientComponent';
import TransactionSettingAlert from '@components/transactionSetting';
import useWalletSelector from '@hooks/useWalletSelector';
import { UTXO, satsToBtc, getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import Brc20FeesComponent from '@screens/confirmBrc20Transaction/Brc20FeesComponent';

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
  marginTop: props.theme.spacing(11),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(5),
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

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(16),
  textAlign: 'left',
}));

function ConfirmBtcTransactionComponent({
  recipients,
  nonOrdinalUtxos,
  currentFeeRate,
  setCurrentFeeRate,
  transactionFee,
  inscriptionFee,
  totalFee,
  btcFee,
  onConfirmClick,
  onCancelClick,
}: {
  recipients: Recipient[];
  nonOrdinalUtxos?: UTXO[];
  currentFeeRate: BigNumber;
  setCurrentFeeRate: (feeRate: BigNumber) => void;
  transactionFee: BigNumber;
  inscriptionFee: BigNumber;
  totalFee: BigNumber;
  btcFee: BigNumber;
  onConfirmClick: () => void;
  onCancelClick: () => void;
}) {
  const { t } = useTranslation('translation');
  const { network, btcFiatRate, fiatCurrency } = useWalletSelector();

  const [isLoading, setIsLoading] = useState(false);
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const [error, setError] = useState('');

  const onAdvancedSettingClick = () => {
    setShowFeeSettings(true);
  };

  const closeTransactionSettingAlert = () => {
    setShowFeeSettings(false);
  };

  const onApplyClick = ({ fee, feeRate }: { fee: string; feeRate?: string }) => {
    // TODO edit fees
    setCurrentFeeRate(new BigNumber(currentFeeRate));
  };

  const handleOnConfirmClick = () => {
    onConfirmClick();
  };

  const getAmountString = (amount: BigNumber, currency: string) => (
    <NumericFormat
      value={amount.toString()}
      displayType="text"
      thousandSeparator
      suffix={` ${currency}`}
    />
  );
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
              value={satsToBtc(amountSats).toString()}
              totalRecipient={recipients.length}
              currencyType="FT"
              title={t('CONFIRM_TRANSACTION.AMOUNT')}
              showSenderAddress={false}
            />
          ))}
          <TransactionDetailComponent
            title={t('CONFIRM_TRANSACTION.NETWORK')}
            value={network.type}
          />
          <TransactionDetailComponent
            title={t('BITCOIN_VALUE')}
            value={getAmountString(btcFee, 'sats')}
          />
          <Brc20FeesComponent fees={fees} />
          {/* Edit Fees */}
          <Button onClick={onAdvancedSettingClick}>
            <>
              <ButtonImage src={SettingIcon} />
              <ButtonText>{t('CONFIRM_TRANSACTION.EDIT_FEES')}</ButtonText>
            </>
          </Button>
          <TransactionSettingAlert
            visible={showFeeSettings}
            fee={new BigNumber(transactionFee).toString()}
            feePerVByte={currentFeeRate}
            type="Ordinals"
            btcRecipients={recipients}
            onApplyClick={onApplyClick}
            onCrossClick={closeTransactionSettingAlert}
            loading={isLoading}
            isRestoreFlow={false}
            showFeeSettings={showFeeSettings}
            setShowFeeSettings={setShowFeeSettings}
          />
        </Container>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
        </ErrorContainer>
      </OuterContainer>
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton
            text={t('CONFIRM_TRANSACTION.CANCEL')}
            transparent
            onPress={onCancelClick}
            disabled={isLoading}
          />
        </TransparentButtonContainer>
        <ActionButton
          text={t('CONFIRM_TRANSACTION.CONFIRM')}
          disabled={isLoading}
          processing={isLoading}
          onPress={handleOnConfirmClick}
        />
      </ButtonContainer>
    </>
  );
}

export default ConfirmBtcTransactionComponent;
