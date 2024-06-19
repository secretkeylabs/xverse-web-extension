import AccountHeaderComponent from '@components/accountHeader';
import ActionButton from '@components/button';
import InfoContainer from '@components/infoContainer';
import BottomBar from '@components/tabBar';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useCoinRates from '@hooks/queries/useCoinRates';
import useDebounce from '@hooks/useDebounce';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { FadersHorizontal } from '@phosphor-icons/react';
import type { BRC20ErrorCode, SettingsNetwork } from '@secretkeylabs/xverse-core';
import {
  AnalyticsEvents,
  getBtcFiatEquivalent,
  useBrc20TransferFees,
  validateBtcAddressIsTaproot,
} from '@secretkeylabs/xverse-core';
import Callout, { CalloutProps } from '@ui-library/callout';
import {
  Brc20TransferEstimateFeesParams,
  ConfirmBrc20TransferState,
  ExecuteBrc20TransferState,
  getFeeValuesForBrc20OneStepTransfer,
} from '@utils/brc20';
import { isInOptions } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Brc20FeesComponent from './brc20FeesComponent';
import { EditFees, OnChangeFeeRate } from './editFees';
import RecipientCard, { RecipientCardProps } from './recipientCard';

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
  marginBottom: props.theme.spacing(10),
  textAlign: 'left',
}));

const StyledCallouts = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(6)}px;
  margin-bottom: ${(props) => props.theme.spacing(12)}px;
`;

const RecipientCardContainer = styled.div`
  margin-bottom: ${(props) => props.theme.spacing(6)}px;
`;

const useConfirmBrc20Transfer = (): {
  callouts: CalloutProps[];
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
  recipient: RecipientCardProps;
  showFeeSettings: boolean;
  txFee: BigNumber;
  showFeeWarning: boolean;
} => {
  /* hooks */
  const { t } = useTranslation('translation');
  const { network, fiatCurrency, feeMultipliers } = useWalletSelector();
  const selectedAccount = useSelectedAccount();
  const { btcAddress, ordinalsAddress } = selectedAccount;
  const { btcFiatRate } = useCoinRates();
  const navigate = useNavigate();
  const {
    recipientAddress,
    estimateFeesParams,
    estimatedFees: initEstimatedFees,
    token,
  }: ConfirmBrc20TransferState = useLocation().state;
  const [showFeeWarning, setShowFeeWarning] = useState(false);
  const transactionContext = useTransactionContext();

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
    context: transactionContext,
  });

  const { txFee, inscriptionFee, totalFee, transferUtxoValue } =
    getFeeValuesForBrc20OneStepTransfer(commitValueBreakdown ?? initEstimatedFees.valueBreakdown);

  useEffect(() => {
    if (feeMultipliers && txFee.isGreaterThan(new BigNumber(feeMultipliers.thresholdHighSatsFee))) {
      setShowFeeWarning(true);
    } else if (showFeeWarning) {
      setShowFeeWarning(false);
    }
  }, [txFee, feeMultipliers]);

  /* callbacks */
  const handleClickConfirm = () => {
    setIsConfirmLoading(true);
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
    trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
      protocol: 'brc20',
      action: 'transfer',
      wallet_type: selectedAccount?.accountType || 'software',
    });
    navigate('/execute-brc20-tx', { state });
    setIsConfirmLoading(false);
  };

  const handleClickCancel = () => {
    navigate(-1);
  };

  const handleClickApplyFee: OnChangeFeeRate = (feeRate: string) => {
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
      fiatValue: getBtcFiatEquivalent(totalFee, BigNumber(btcFiatRate)),
      fiatCurrency,
    },
  ];

  const errorMessage = errorCode ? t(`CONFIRM_BRC20.ERROR_CODES.${errorCode}`) : error;

  const recipient: RecipientCardProps = {
    address: recipientAddress,
    amountBrc20: new BigNumber(estimateFeesParams.amount),
    amountSats: new BigNumber(transferUtxoValue),
    fungibleToken: token,
  };

  const callouts: CalloutProps[] = [];
  if (!validateBtcAddressIsTaproot(recipientAddress)) {
    callouts.push({
      variant: 'info',
      bodyText: t('SEND_BRC20.MAKE_SURE_THE_RECIPIENT'),
    });
  }
  if (recipientAddress === ordinalsAddress || recipientAddress === btcAddress) {
    callouts.push({
      variant: 'info',
      bodyText: t('SEND_BRC20.YOU_ARE_TRANSFERRING_TO_YOURSELF'),
    });
  }

  return {
    callouts,
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
    recipient,
    showFeeSettings,
    txFee,
    showFeeWarning,
  };
};

function ConfirmBrc20Transaction() {
  const { t } = useTranslation('translation');
  const {
    callouts,
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
    recipient,
    showFeeSettings,
    txFee,
    showFeeWarning,
  } = useConfirmBrc20Transfer();

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <ScrollContainer>
        <OuterContainer>
          <Container>
            {showFeeWarning && (
              <InfoContainer
                type="Warning"
                bodyText={t('CONFIRM_TRANSACTION.HIGH_FEE_WARNING_TEXT')}
              />
            )}

            <ReviewTransactionText>
              {t('CONFIRM_TRANSACTION.REVIEW_TRANSACTION')}
            </ReviewTransactionText>
            {callouts?.length > 0 && (
              <StyledCallouts>
                {callouts.map((callout) => (
                  <Callout key={callout.bodyText} {...callout} />
                ))}
              </StyledCallouts>
            )}
            <RecipientCardContainer>
              <RecipientCard
                address={recipient.address}
                amountBrc20={recipient.amountBrc20}
                amountSats={recipient.amountSats}
                fungibleToken={recipient.fungibleToken}
              />
            </RecipientCardContainer>
            <TransactionDetailComponent
              title={t('CONFIRM_TRANSACTION.NETWORK')}
              value={network.type}
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
