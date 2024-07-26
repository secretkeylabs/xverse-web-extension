import RecipientSelector from '@components/recipientSelector';
import TokenImage from '@components/tokenImage';
import type { RuneSummary } from '@secretkeylabs/xverse-core';
import ConfirmBtcTransaction from 'app/components/confirmBtcTransaction';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';
import AmountSelector from './amountSelector';
import type { TransactionSummary } from './helpers';
import { Step, getNextStep } from './steps';

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0;
`;

const Title = styled.div`
  ${(props) => props.theme.typography.headline_xs}
  margin-top: ${(props) => props.theme.spacing(6)}px;
  margin-bottom: ${(props) => props.theme.spacing(12)}px;
`;

const Container = styled.div`
  display: flex;
  flex: 1 1 100%;
  min-height: 370px;
`;

type Props = {
  summary: TransactionSummary | undefined;
  runeSummary: RuneSummary | undefined;
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
  addressEditable: boolean;
  amountEditable: boolean;
  onConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isSubmitting: boolean;
};

function StepDisplay({
  summary,
  runeSummary,
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
  addressEditable,
  amountEditable,
  onConfirm,
  onBack,
  onCancel,
  isLoading,
  isSubmitting,
}: Props) {
  const { t } = useTranslation('translation');
  const header = (
    <TitleContainer>
      <TokenImage currency="BTC" />
      <Title>{t('SEND.SEND')}</Title>
    </TitleContainer>
  );
  switch (currentStep) {
    case Step.SelectRecipient:
      return (
        <SendLayout selectedBottomTab="dashboard" onClickBack={onBack}>
          <Container>
            <RecipientSelector
              header={header}
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient, amountEditable))}
              isLoading={isLoading}
            />
          </Container>
        </SendLayout>
      );
    case Step.SelectAmount:
      return (
        <SendLayout selectedBottomTab="dashboard" onClickBack={onBack}>
          <Container>
            <AmountSelector
              header={header}
              amountSats={amountSats}
              setAmountSats={setAmountSats}
              feeRate={feeRate}
              setFeeRate={setFeeRate}
              sendMax={sendMax}
              setSendMax={setSendMax}
              fee={(summary as TransactionSummary)?.fee.toString()}
              getFeeForFeeRate={getFeeForFeeRate}
              dustFiltered={(summary as TransactionSummary)?.dustFiltered ?? false}
              onNext={() => setCurrentStep(getNextStep(Step.SelectAmount, amountEditable))}
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
          runeSummary={runeSummary}
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
