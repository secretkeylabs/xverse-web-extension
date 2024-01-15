import ConfirmBitcoinTransaction from '@components/confirmBtcTransaction';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';
import AmountSelector from './amountSelector';
import RecipientSelector from './recipientSelector';
import { Step, getNextStep } from './steps';

type StepDisplayProps = {
  summary: btcTransaction.TransactionSummary | undefined;
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  amountSats: string;
  setAmountSats: (amount: string) => void;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  amountEditable: boolean;
  onConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

function StepDisplay({
  summary,
  currentStep,
  setCurrentStep,
  recipientAddress,
  setRecipientAddress,
  amountSats,
  setAmountSats,
  feeRate,
  setFeeRate,
  sendMax,
  setSendMax,
  amountEditable,
  onConfirm,
  onBack,
  onCancel,
  isLoading,
}: StepDisplayProps) {
  const { t } = useTranslation('translation');

  switch (currentStep) {
    case Step.SelectRecipient:
      return (
        <RecipientSelector
          recipientAddress={recipientAddress}
          setRecipientAddress={setRecipientAddress}
          onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient, amountEditable))}
        />
      );
    case Step.SelectAmount:
      return (
        <AmountSelector
          amountSats={amountSats}
          setAmountSats={setAmountSats}
          feeRate={feeRate}
          setFeeRate={setFeeRate}
          sendMax={sendMax}
          setSendMax={setSendMax}
          onNext={() => setCurrentStep(getNextStep(Step.SelectAmount, amountEditable))}
          isLoading={isLoading}
        />
      );
    case Step.Confirm:
      // TODO: ensure summary is not undefined
      return (
        <ConfirmBitcoinTransaction
          inputs={summary!.inputs}
          outputs={summary!.outputs}
          feeOutput={summary!.feeOutput}
          isLoading={false}
          isSubmitting={false}
          confirmText={t('CONFIRM')}
          cancelText={t('CANCEL')}
          onBackClick={onBack}
          onCancel={onCancel}
          onConfirm={onConfirm}
          isBroadcast
          hideBottomBar
        />
      );
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
}

export default StepDisplay;
