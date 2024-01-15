import AmountSelector from './amountSelector';
import RecipientSelector from './recipientSelector';
import { Step, getNextStep } from './steps';

type StepDisplayProps = {
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
  onCancel: () => void;
  isLoading: boolean;
};

function StepDisplay({
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
  onCancel,
  isLoading,
}: StepDisplayProps) {
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
      return <div>Confirm</div>;
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
}

export default StepDisplay;
