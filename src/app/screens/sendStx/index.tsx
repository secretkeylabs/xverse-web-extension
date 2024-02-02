import TokenImage from '@components/tokenImage';

import { isInOptions } from '@utils/helper';
import SendLayout from 'app/layouts/sendLayout';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Step, getNextStep, getPreviousStep } from './stepResolver';
import Step1SelectRecipientAndMemo from './steps/Step1SelectRecipient';
import Step2SelectAmount from './steps/Step2SelectAmount';
import Step3Confirm from './steps/Step3Confirm';

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

  const location = useLocation();
  const { recipientAddress: stateAddress, amountToSend, stxMemo } = location.state || {};

  // Shared states
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 states
  const [recipientAddress, setRecipientAddress] = useState(stateAddress ?? '');
  const [recipientDomain, setRecipientDomain] = useState('');
  const [memo, setMemo] = useState(stxMemo ?? '');

  // Step 2 states
  const [amount, setAmount] = useState(amountToSend ?? '0');
  const [sendMax, setSendMax] = useState(false);
  const [feeRate, setFeeRate] = useState('');
  const [unsignedSendStxTx, setUnsignedSendStxTx] = useState('');

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
              // recipientDomain={recipientDomain}
              setRecipientDomain={setRecipientDomain}
              memo={memo}
              setMemo={setMemo}
              onNext={() => setCurrentStep(getNextStep(Step.SelectRecipient, true))}
              isLoading={isLoading}
            />
          </Container>
        </SendLayout>
      );
    case Step.SelectAmount:
      return (
        <SendLayout selectedBottomTab="dashboard" onClickBack={handleBackButtonClick}>
          <Container>
            <Step2SelectAmount
              header={header}
              amount={amount}
              setAmount={setAmount}
              feeRate={feeRate}
              setFeeRate={setFeeRate}
              sendMax={sendMax}
              setSendMax={setSendMax}
              fee=""
              getFeeForFeeRate={(fee) => Promise.resolve(fee)}
              dustFiltered={false}
              onNext={() => setCurrentStep(getNextStep(Step.SelectAmount, true))}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              unsignedSendStxTx={unsignedSendStxTx}
              setUnsignedSendStxTx={setUnsignedSendStxTx}
              recipientAddress={recipientAddress}
              memo={memo}
            />
          </Container>
        </SendLayout>
      );
    case Step.Confirm:
      return <Step3Confirm unsignedSendStxTx={unsignedSendStxTx} />;
    default:
      throw new Error(`Unknown step: ${currentStep}`);
  }
}

export default SendStxScreen;
