import OrdinalIcon from '@assets/img/rareSats/ic_ordinal_small_over_card.svg';
import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RecipientSelector from '@components/recipientSelector';
import useTextOrdinalContent from '@hooks/useTextOrdinalContent';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import { getBrc20Details, type Inscription, type RuneSummary } from '@secretkeylabs/xverse-core';
import Avatar from '@ui-library/avatar';
import {
  getInscriptionsCollectionGridItemSubText,
  getInscriptionsCollectionGridItemSubTextColor,
} from '@utils/inscriptions';
import { useMemo } from 'react';
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
  summary: TransactionSummary | undefined;
  runeSummary: RuneSummary | undefined;
  ordinal?: Inscription;
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
  summary,
  runeSummary,
  ordinal,
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

  const textContent = useTextOrdinalContent(ordinal);
  const contentType = ordinal?.content_type ?? '';
  const brc20Details = useMemo(
    () => getBrc20Details(textContent!, contentType),
    [textContent, contentType],
  );
  const brc20Status = getInscriptionsCollectionGridItemSubText(ordinal);
  const brc20StatusColor = getInscriptionsCollectionGridItemSubTextColor(ordinal);
  const brc20Summary = brc20Details
    ? {
        ...brc20Details,
        status: brc20Status,
        statusColor: brc20StatusColor,
      }
    : undefined;

  let header: React.ReactNode = (
    <TitleContainer>
      <Title>{t('SEND.SEND_TO')}</Title>
    </TitleContainer>
  );

  if (ordinal) {
    header = (
      <TitleContainer>
        <Avatar src={<OrdinalImage ordinal={ordinal} placeholderIcon={OrdinalIcon} />} />
        <Title>{t('SEND.SEND')} Ordinal</Title>
      </TitleContainer>
    );
  }

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
          summary={summary}
          runeSummary={runeSummary}
          brc20Summary={brc20Summary}
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
