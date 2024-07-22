import OrdinalIcon from '@assets/img/rareSats/ic_ordinal_small_over_card.svg';
import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RecipientSelector from '@components/recipientSelector';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import type { Inscription } from '@secretkeylabs/xverse-core';
import Avatar from '@ui-library/avatar';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';
import { Step, getNextStep } from './steps';

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
  ordinal: Inscription;
  summary: TransactionSummary | undefined;
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  feeRate: string;
  setFeeRate: (feeRate: string) => void;
  getFeeForFeeRate: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number | undefined>;
  onConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isSubmitting: boolean;
  insufficientFunds: boolean;
};

function StepDisplay({
  ordinal,
  summary,
  currentStep,
  setCurrentStep,
  recipientAddress,
  setRecipientAddress,
  feeRate,
  setFeeRate,
  getFeeForFeeRate,
  onConfirm,
  onBack,
  onCancel,
  isLoading,
  isSubmitting,
  insufficientFunds,
}: Props) {
  const { t } = useTranslation('translation');
  const header = (
    <TitleContainer>
      <Avatar src={<OrdinalImage ordinal={ordinal} placeholderIcon={OrdinalIcon} />} />
      <Title>{t('SEND.SEND')} Ordinal</Title>
    </TitleContainer>
  );
  switch (currentStep) {
    case Step.SelectRecipient:
      return (
        <SendLayout selectedBottomTab="nft" onClickBack={onBack}>
          <Container>
            <RecipientSelector
              header={header}
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient))}
              isLoading={isLoading}
              calloutText={t('SEND.MAKE_SURE_THE_RECIPIENT')}
              insufficientFunds={insufficientFunds}
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
          inputs={summary.inputs}
          outputs={summary.outputs}
          feeOutput={summary.feeOutput}
          showCenotaphCallout={!!summary?.runeOp?.Cenotaph?.flaws}
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
          hideBottomBar
          isBroadcast
        />
      );
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
}

export default StepDisplay;
