import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RecipientSelector from '@components/recipientSelector';
import useTextOrdinalContent from '@hooks/useTextOrdinalContent';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import { getBrc20Details, type Inscription } from '@secretkeylabs/xverse-core';
import {
  getInscriptionsCollectionGridItemSubText,
  getInscriptionsCollectionGridItemSubTextColor,
} from '@utils/inscriptions';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';
import { Step, getNextStep } from './steps';

const Container = styled.div`
  display: flex;
  flex: 1 1 100%;
  min-height: 370px;
`;

type Props = {
  summary: TransactionSummary | undefined;
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

  switch (currentStep) {
    case Step.SelectRecipient:
      return (
        <RecipientSelector
          recipientAddress={recipientAddress}
          setRecipientAddress={setRecipientAddress}
          onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient))}
          isLoading={isLoading}
          calloutText={t('SEND.MAKE_SURE_THE_RECIPIENT')}
          insufficientFunds={insufficientFunds}
          onBack={onBack}
          selectedBottomTab="nft"
          addressType="btc_ordinals"
        />
      );
    case Step.Confirm:
      if (!summary) {
        // this should never happen as there are gates to prevent getting to this step without a summary
        return null;
      }
      return (
        <ConfirmBtcTransaction
          summary={summary}
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
