import ConfirmBitcoinTransaction from '@components/confirmBtcTransaction';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import AmountSelector from './amountSelector';
import { TransactionSummary } from './helpers';
import RecipientSelector from './recipientSelector';
import { Step, getNextStep } from './steps';

const Container = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  padding: 0 16px;
  margin-top: 16px;
  overflow-y: auto;
`;

type StepDisplayProps = {
  summary: TransactionSummary | undefined;
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
  getFeeForFeeRate: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number | undefined>;
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
  getFeeForFeeRate,
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
        <Container>
          <RecipientSelector
            recipientAddress={recipientAddress}
            setRecipientAddress={setRecipientAddress}
            onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient, amountEditable))}
            isLoading={isLoading}
          />
        </Container>
      );
    case Step.SelectAmount:
      return (
        <Container>
          <AmountSelector
            amountSats={amountSats}
            setAmountSats={setAmountSats}
            feeRate={feeRate}
            setFeeRate={setFeeRate}
            sendMax={sendMax}
            setSendMax={setSendMax}
            fee={summary?.fee.toString()}
            getFeeForFeeRate={getFeeForFeeRate}
            dustFiltered={summary?.dustFiltered ?? false}
            onNext={() => setCurrentStep(getNextStep(Step.SelectAmount, amountEditable))}
            hasSufficientFunds={!!summary}
            isLoading={isLoading}
          />
        </Container>
      );
    case Step.Confirm:
      if (!summary) {
        // this should never happen as there are gates to prevent getting to this step without a summary
        setCurrentStep(Step.SelectAmount);
        return null;
      }
      return (
        <ConfirmBitcoinTransaction
          inputs={summary.inputs}
          outputs={summary.outputs}
          feeOutput={summary.feeOutput}
          isLoading={false}
          confirmText={t('CONFIRM')}
          cancelText={t('CANCEL')}
          onBackClick={onBack}
          onCancel={onCancel}
          onConfirm={onConfirm}
          getFeeForFeeRate={getFeeForFeeRate}
          onFeeRateSet={(newFeeRate) => setFeeRate(newFeeRate.toString())}
          isSubmitting={false}
          isBroadcast
          hideBottomBar
        />
      );
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
}

export default StepDisplay;
