import TokenImage from '@components/tokenImage';
import { FungibleToken, RuneSummary } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';
import AmountSelector from './amountSelector';
import { TransactionSummary } from './helpers';
import RecipientSelector from './recipientSelector';
import { Step, getNextStep } from './steps';
import ConfirmBtcTransactionSingleParty from '@components/confirmBtcTransactionSingleParty';

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0;
`;

const Title = styled.div`
  ${(props) => props.theme.typography.headline_xs}
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.l};
`;

const Container = styled.div`
  display: flex;
  flex: 1 1 100%;
  min-height: 370px;
`;

type Props = {
  token: FungibleToken;
  summary: TransactionSummary | undefined;
  runeSummary: RuneSummary | undefined;
  amountToSend: string;
  setAmountToSend: (amount: string) => void;
  amountError: string;
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  sendMax: boolean;
  setSendMax: (sendMax: boolean) => void;
  getFeeForFeeRate: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number | undefined>;
  onConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isSubmitting: boolean;
};

function StepDisplay({
  token,
  summary,
  runeSummary,
  amountToSend,
  setAmountToSend,
  amountError,
  currentStep,
  setCurrentStep,
  recipientAddress,
  setRecipientAddress,
  feeRate,
  setFeeRate,
  sendMax,
  setSendMax,
  getFeeForFeeRate,
  onConfirm,
  onBack,
  onCancel,
  isLoading,
  isSubmitting,
}: Props) {
  const { t } = useTranslation('translation');
  const header = (
    <TitleContainer>
      <TokenImage currency="FT" fungibleToken={token} />
      <Title>
        {t('SEND.SEND')} {token.name}
      </Title>
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
              onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient))}
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
              token={token}
              header={header}
              amountToSend={amountToSend}
              setAmountToSend={setAmountToSend}
              amountError={amountError}
              feeRate={feeRate}
              setFeeRate={setFeeRate}
              sendMax={sendMax}
              setSendMax={setSendMax}
              fee={summary?.fee.toString()}
              getFeeForFeeRate={getFeeForFeeRate}
              dustFiltered={summary?.dustFiltered ?? false}
              onNext={() => setCurrentStep(getNextStep(Step.SelectAmount))}
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
        <ConfirmBtcTransactionSingleParty
          inputs={summary.inputs}
          outputs={summary.outputs}
          feeOutput={summary.feeOutput}
          recipientAddress={recipientAddress}
          showCenotaphCallout={!!summary?.runeOp?.Cenotaph?.flaws}
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
