import TokenImage from '@components/tokenImage';
import { isInOptions } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SendLayout from 'app/layouts/sendLayout';
import { Step, getNextStep, getPreviousStep } from './stepResolver';
import Step1SelectRecipientAndMemo from './steps/Step1SelectRecipient';

const Container = styled.div`
  display: flex;
  flex: 1 1 100%;
  min-height: 370px;
`;

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

function SendStxScreen() {
  const isInOption = isInOptions();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const { t } = useTranslation('translation');

  // Step 1 states
  const [recipientAddress, setRecipientAddress] = useState('');
  const [memo, setMemo] = useState('');

  const handleCancel = () => {
    if (isInOption) {
      window.close();
      return;
    }
    navigate('/');
  };

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep, true));
    } else {
      handleCancel();
    }
  };

  const header = (
    <TitleContainer>
      <TokenImage token="STX" />
      <Title>{t('SEND.SEND')}</Title>
    </TitleContainer>
  );

  switch (currentStep) {
    case Step.SelectRecipient:
      return (
        <SendLayout selectedBottomTab="dashboard" onClickBack={handleBackButtonClick}>
          <Container>
            <Step1SelectRecipientAndMemo
              header={header}
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              memo={memo}
              setMemo={setMemo}
              onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient, true))}
              isLoading={false}
            />
          </Container>
        </SendLayout>
      );
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
}

export default SendStxScreen;
