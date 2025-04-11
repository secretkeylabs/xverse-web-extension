import RecipientSelector from '@components/recipientSelector';
import TokenImage from '@components/tokenImage';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import { type InputFeedbackProps } from '@ui-library/inputFeedback';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';
import AmountSelector from './amountSelector';
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
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 300px;
  white-space: nowrap;
`;

const Container = styled.div`
  display: flex;
  flex: 1 1 100%;
  min-height: 370px;
`;

type Props = {
  token: FungibleToken;
  amountToSend: string;
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  amountError: InputFeedbackProps | null;
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  onBack: () => void;
  isLoading: boolean;
  isNextEnabled: boolean;
  processing: boolean;
};

function StepDisplay({
  token,
  amountToSend,
  onAmountChange,
  amountError,
  currentStep,
  setCurrentStep,
  recipientAddress,
  setRecipientAddress,
  onBack,
  isLoading,
  isNextEnabled,
  processing,
}: Props) {
  const { t } = useTranslation('translation');

  switch (currentStep) {
    case Step.SelectRecipient:
      return (
        <RecipientSelector
          recipientAddress={recipientAddress}
          setRecipientAddress={setRecipientAddress}
          onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient))}
          isLoading={isLoading}
          onBack={onBack}
          selectedBottomTab="dashboard"
          addressType="btc_ordinals"
        />
      );
    case Step.SelectAmount:
      return (
        <SendLayout selectedBottomTab="dashboard" onClickBack={onBack}>
          <Container>
            <AmountSelector
              token={token}
              header={
                <TitleContainer>
                  <TokenImage currency="FT" fungibleToken={token} />
                  <Title>
                    {t('SEND.SEND')} {token.ticker}
                  </Title>
                </TitleContainer>
              }
              amountToSend={amountToSend}
              onAmountChange={onAmountChange}
              amountError={amountError}
              onNext={() => setCurrentStep(getNextStep(Step.SelectAmount))}
              processing={processing}
              isNextEnabled={isNextEnabled}
            />
          </Container>
        </SendLayout>
      );
    case Step.Confirm:
      // The confirm step is handled by the useEffect above
      // which will trigger the onConfirm action and navigate to the confirm-brc20-tx route
      return null;
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
}

export default StepDisplay;
