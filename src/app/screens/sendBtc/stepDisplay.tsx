import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RecipientSelector from '@components/recipientSelector';
import type {
  BtcPaymentType,
  KeystoneTransport,
  LedgerTransport,
} from '@secretkeylabs/xverse-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';
import AccountSelector from './accountSelector';
import AmountSelector from './amountSelector';
import type { TransactionSummary } from './helpers';
import { Step, getNextStep, getPreviousStep } from './steps';

const Container = styled.div`
  display: flex;
  flex: 1 1 100%;
  min-height: 370px;
`;

type Props = {
  summary: TransactionSummary | undefined;
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  overridePaymentType: BtcPaymentType;
  setOverridePaymentType: (paymentType: BtcPaymentType) => void;
  amountSats: string;
  setAmountSats: (amount: string) => void;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  getFeeForFeeRate: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number | undefined>;
  onConfirm: (options?: {
    ledgerTransport?: LedgerTransport;
    keystoneTransport?: KeystoneTransport;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
  isSubmitting: boolean;
  userCanSwitchPayType: boolean;
};

function StepDisplay({
  summary,
  currentStep,
  setCurrentStep,
  recipientAddress,
  setRecipientAddress,
  overridePaymentType,
  setOverridePaymentType,
  amountSats,
  setAmountSats,
  feeRate,
  setFeeRate,
  sendMax,
  setSendMax,
  getFeeForFeeRate,
  onConfirm,
  onCancel,
  isLoading,
  isSubmitting,
  userCanSwitchPayType,
}: Props) {
  const { t } = useTranslation('translation');

  const [shouldSkipAccountSelect, setShouldSkipAccountSelect] = useState(false);

  const showAccountSelect = !shouldSkipAccountSelect && userCanSwitchPayType;

  const onBack = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep, showAccountSelect));
    } else {
      onCancel();
    }
  };

  switch (currentStep) {
    case Step.SelectRecipient:
      return (
        <RecipientSelector
          recipientAddress={recipientAddress}
          setRecipientAddress={setRecipientAddress}
          onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient, showAccountSelect))}
          isLoading={isLoading}
          onBack={onBack}
          selectedBottomTab="dashboard"
          addressType="btc_payment"
        />
      );
    case Step.SelectAccount:
      return (
        <SendLayout selectedBottomTab="dashboard" onClickBack={onBack}>
          <Container>
            <AccountSelector
              overridePaymentType={overridePaymentType}
              setOverridePaymentType={setOverridePaymentType}
              onNext={() => setCurrentStep(getNextStep(Step.SelectAccount, showAccountSelect))}
              onSkipDetected={() => setShouldSkipAccountSelect(true)}
            />
          </Container>
        </SendLayout>
      );
    case Step.SelectAmount:
      return (
        <SendLayout selectedBottomTab="dashboard" onClickBack={onBack}>
          <Container>
            <AmountSelector
              recipientAddress={recipientAddress}
              amountSats={amountSats}
              overridePaymentType={overridePaymentType}
              setAmountSats={setAmountSats}
              feeRate={feeRate}
              setFeeRate={setFeeRate}
              sendMax={sendMax}
              setSendMax={setSendMax}
              fee={(summary as TransactionSummary)?.fee.toString()}
              getFeeForFeeRate={getFeeForFeeRate}
              dustFiltered={(summary as TransactionSummary)?.dustFiltered ?? false}
              onNext={() => setCurrentStep(getNextStep(Step.SelectAmount, showAccountSelect))}
              hasSufficientFunds={!!summary || isLoading}
              isLoading={isLoading}
            />
          </Container>
        </SendLayout>
      );
    case Step.Confirm:
      if (!summary) {
        // this should never happen as there are gates to prevent getting to this step without a summary
        return null;
      }
      return (
        <ConfirmBtcTransaction
          summary={summary}
          isLoading={false}
          confirmText={t('COMMON.CONFIRM')}
          cancelText={t('COMMON.CANCEL')}
          onBackClick={onBack}
          onCancel={onCancel}
          onConfirm={onConfirm}
          getFeeForFeeRate={getFeeForFeeRate}
          onFeeRateSet={(newFeeRate) => setFeeRate(newFeeRate.toString())}
          feeRate={+feeRate}
          isSubmitting={isSubmitting}
          isBroadcast
          hideBottomBar
        />
      );
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
}

export default StepDisplay;
