import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import PasswordIcon from '@assets/img/createPassword/Password.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NewPassword from './newPassword';
import ConfirmPassword from './confirmPassword';
import { StoreState } from '@stores/root/reducer';
import { storeWalletSeed } from '@core/wallet';

const Container = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: props.theme.spacing(8),
}));

const StepsContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.spacing(10),
  justifyContent: 'center',
}));

const StepDot = styled.div((props) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: props.active
    ? props.theme.colors.action.classic
    : props.theme.colors.background.elevation3,
  marginRight: props.theme.spacing(4),
}));

const HeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
  marginTop: props.theme.spacing(15),
}));

const HeaderContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(32),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

function CreatePassword(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'CREATE_PASSWORD_SCREEN' });
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { seedPhrase } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));

  const handleContinuePasswordCreation = () => {
    setCurrentStepIndex(1);
  };

  const handleConfirmPassword = async () => {
    await storeWalletSeed(seedPhrase, password);
    navigate('/create-wallet-success');
  };

  const handleNewPasswordBack = () => {
    navigate('/backup');
  };

  const handleConfirmPasswordBack = () => {
    setCurrentStepIndex(0);
  };

  return (
    <Container>
      <StepsContainer>
        {Array(2)
          .fill(0)
          .map((view, index) => (
            <StepDot active={index === currentStepIndex} key={index.toString() + 1} />
          ))}
      </StepsContainer>
      <HeaderContainer>
        <img src={PasswordIcon} alt="passoword" />
        <HeaderText>
          {currentStepIndex === 0 ? t('CREATE_PASSWORD_TITLE') : t('CONFIRM_PASSWORD_TITLE')}
        </HeaderText>
      </HeaderContainer>
      {currentStepIndex === 0 ? (
        <NewPassword
          password={password}
          setPassword={setPassword}
          handleContinue={handleContinuePasswordCreation}
          handleBack={handleNewPasswordBack}
        />
      ) : (
        <ConfirmPassword
          password={password}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          handleContinue={handleConfirmPassword}
          handleBack={handleConfirmPasswordBack}
        />
      )}
    </Container>
  );
}

export default CreatePassword;
