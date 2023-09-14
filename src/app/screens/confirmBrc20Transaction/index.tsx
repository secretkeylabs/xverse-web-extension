import AccountHeaderComponent from '@components/accountHeader';
import ActionButton from '@components/button';
import BigNumber from 'bignumber.js';
import BottomBar from '@components/tabBar';
import {
  Brc20TransferEstimateFeesParams,
  ConfirmBrc20TransferState,
  ExecuteBrc20TransferState,
  getFeeValuesForBrc20OneStepTransfer,
} from '@utils/brc20';
import { FadersHorizontal } from '@phosphor-icons/react';
import { getBtcFiatEquivalent, useBrc20TransferFees } from '@secretkeylabs/xverse-core';
import RecipientComponent from '@components/recipientComponent';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import styled from 'styled-components';
import useDebounce from '@hooks/useDebounce';
import useWalletSelector from '@hooks/useWalletSelector';
import { NumericFormat } from 'react-number-format';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BRC20ErrorCode } from '@secretkeylabs/xverse-core/transactions/brc20';
import type { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import type { FungibleToken, SettingsNetwork } from '@secretkeylabs/xverse-core';
import Brc20FeesComponent from './brc20FeesComponent';
import { EditFees, OnChangeFeeRate } from './editFees';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

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
  gap: props.theme.spacing(3),
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  marginTop: props.theme.spacing(12),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const FadersHorizontalIcon = styled(FadersHorizontal)((props) => ({
  color: props.theme.colors.white_0,
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

const useConfirmBrc20Transfer = (): {
  btcFee: BigNumber;
  errorMessage: string;
  estimateFeesParams: Brc20TransferEstimateFeesParams;
  fees: any[];
  handleClickAdvancedSetting: () => void;
  handleClickApplyFee: OnChangeFeeRate;
  handleClickCancel: () => void;
  handleClickCloseFees: () => void;
  handleClickConfirm: () => void;
  isConfirmLoading: boolean;
  isFeeLoading: boolean;
  network: SettingsNetwork;
  recipients: Recipient[];
  showFeeSettings: boolean;
  token: FungibleToken;
  txFee: BigNumber;
} => {
  /* hooks */
  const { t } = useTranslation('translation');
  const { network, btcFiatRate, fiatCurrency, selectedAccount } = useWalletSelector();
  const navigate = useNavigate();
  const {
    recipientAddress,
    estimateFeesParams,
    estimatedFees: initEstimatedFees,
    token,
  }: ConfirmBrc20TransferState = useLocation().state;

  useResetUserFlow('/confirm-brc20-tx');

  /* state */
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const [userInputFeeRate, setUserInputFeeRate] = useState('');
  const [error, setError] = useState<BRC20ErrorCode | ''>('');
  const debouncedUserInputFeeRate = useDebounce(userInputFeeRate, 100);

  const {
    commitValueBreakdown,
    isLoading: isFeeLoading,
    errorCode,
  } = useBrc20TransferFees({
    ...estimateFeesParams,
    feeRate: Number(debouncedUserInputFeeRate),
    skipInitialFetch: true,
  });

  const { txFee, inscriptionFee, totalFee, btcFee } = getFeeValuesForBrc20OneStepTransfer(
    commitValueBreakdown ?? initEstimatedFees.valueBreakdown,
  );

  /* callbacks */
  const handleClickConfirm = () => {
    setIsConfirmLoading(true);
    if (isLedgerAccount(selectedAccount)) {
      // TODO ledger
    }
    // validate brc20 balance again here
    if (estimateFeesParams.amount > Number(token.balance)) {
      setError(t('CONFIRM_BRC20.ERRORS.INSUFFICIENT_BALANCE'));
      return;
    }
    const state: ExecuteBrc20TransferState = {
      recipientAddress,
      estimateFeesParams: {
        ...estimateFeesParams,
        feeRate: Number(debouncedUserInputFeeRate),
      },
      token,
    };
    navigate('/execute-brc20-tx', { state });
    setIsConfirmLoading(false);
  };

  const handleClickCancel = () => {
    navigate(-1);
  };

  const handleClickApplyFee: OnChangeFeeRate = (feeRate) => {
    if (feeRate) {
      setUserInputFeeRate(feeRate);
    }
  };

  const handleClickAdvancedSetting = () => {
    setShowFeeSettings(true);
  };

  const handleClickCloseFees = () => {
    setShowFeeSettings(false);
  };

  /* other */
  const fees = [
    {
      label: 'Transaction Fee',
      value: txFee,
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

  const errorMessage = errorCode ? t(`CONFIRM_BRC20.ERROR_CODES.${errorCode}`) : error;

  const recipients: Recipient[] = [
    { address: recipientAddress, amountSats: new BigNumber(estimateFeesParams.amount) },
  ];

  return {
    btcFee,
    errorMessage,
    estimateFeesParams,
    fees,
    handleClickAdvancedSetting,
    handleClickApplyFee,
    handleClickCancel,
    handleClickCloseFees,
    handleClickConfirm,
    isConfirmLoading,
    isFeeLoading,
    network,
    recipients,
    showFeeSettings,
    token,
    txFee,
  };
};

export function ConfirmBrc20Transaction() {
  const { t } = useTranslation('translation');
  const {
    btcFee,
    errorMessage,
    estimateFeesParams,
    fees,
    handleClickAdvancedSetting,
    handleClickApplyFee,
    handleClickCancel,
    handleClickCloseFees,
    handleClickConfirm,
    isConfirmLoading,
    isFeeLoading,
    network,
    recipients,
    showFeeSettings,
    token,
    txFee,
  } = useConfirmBrc20Transfer();

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <ScrollContainer>
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
                <FadersHorizontalIcon size={20} />
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
            disabled={isConfirmLoading || isFeeLoading}
          />
          <ActionButton
            text={t('CONFIRM_TRANSACTION.CONFIRM')}
            disabled={isConfirmLoading || isFeeLoading}
            processing={isConfirmLoading}
            onPress={handleClickConfirm}
          />
        </ButtonContainer>
        <EditFees
          visible={showFeeSettings}
          onClose={handleClickCloseFees}
          fee={txFee.toString()}
          initialFeeRate={estimateFeesParams.feeRate.toString()}
          onClickApply={handleClickApplyFee}
          onChangeFeeRate={handleClickApplyFee}
          isFeeLoading={isFeeLoading}
          error={errorMessage}
        />
        {!isInOptions() && <BottomBar tab="dashboard" />}
      </ScrollContainer>
    </>
  );
}
export default ConfirmBrc20Transaction;
