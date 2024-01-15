import BottomBar from '@components/tabBar';
import TokenImage from '@components/tokenImage';
import TopRow from '@components/topRow';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import { isInOptions } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import StepDisplay from './stepDisplay';
import { Step, getPreviousStep } from './steps';

const Container = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  padding: 0 16px;
  margin-top: 16px;
  overflow-y: auto;
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

function SendBtcScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();

  useResetUserFlow('/send-btc');

  const location = useLocation();

  // TODO: remove amount and address defaults
  const [recipientAddress, setRecipientAddress] = useState(
    location.state?.recipientAddress || '2N3J2uER8xjdNCpBfaA7K4kWpg9EbJfwfUu',
  );
  const [amount, setAmount] = useState(location.state?.amount || '0.0001');
  const [feeRate, setFeeRate] = useState('1');
  const [sendMax, setSendMax] = useState(false);
  const amountEditable = location.state?.disableAmountEdit ?? true;

  const [currentStep, setCurrentStep] = useState<Step>(0);

  const handleCancel = () => {
    navigate('/');
  };

  const showNavButtons = !isInOptions();

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep, amountEditable));
    } else {
      handleCancel();
    }
  };

  const handleAmountChange = (newAmount: string) => {
    setSendMax(false);
    setAmount(newAmount);
  };

  return (
    <>
      <TopRow title="" onClick={handleBackButtonClick} showBackButton={showNavButtons} />
      <Container>
        <TitleContainer>
          <TokenImage token="BTC" loading={false} />
          <Title>{t('SEND')}</Title>
        </TitleContainer>
        <StepDisplay
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          recipientAddress={recipientAddress}
          setRecipientAddress={setRecipientAddress}
          amount={amount}
          setAmount={handleAmountChange}
          feeRate={feeRate}
          setFeeRate={setFeeRate}
          sendMax={sendMax}
          setSendMax={setSendMax}
          amountEditable={amountEditable}
          onCancel={handleCancel}
        />
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBtcScreen;
