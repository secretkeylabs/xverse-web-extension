import { useWalletExistsContext } from '@components/guards/onboarding';
import PasswordInput from '@components/passwordInput';
import useSecretKey from '@hooks/useSecretKey';
import useWalletReducer from '@hooks/useWalletReducer';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface StepDotProps {
  active: boolean;
}
const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  padding: props.theme.spacing(8),
}));

const StepsContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.spacing(10),
  justifyContent: 'center',
}));

const PasswordContainer = styled.div((props) => ({
  display: 'flex',
  height: '100%',
  marginBottom: props.theme.spacing(15),
  marginTop: props.theme.spacing(32),
}));

const StepDot = styled.div<StepDotProps>((props) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: props.active
    ? props.theme.colors.action.classic
    : props.theme.colors.background.elevation3,
  marginRight: props.theme.spacing(4),
}));

function CreatePassword(): JSX.Element {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const { getSeed, changePassword } = useSecretKey();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CREATE_PASSWORD_SCREEN' });
  const { createWallet } = useWalletReducer();
  const { disableWalletExistsGuard } = useWalletExistsContext();

  useEffect(() => {
    (async () => {
      const seed = await getSeed('');
      setSeedPhrase(seed);
    })();
  }, []);

  const handleContinuePasswordCreation = () => {
    setCurrentStepIndex(1);
  };

  const handleConfirmPassword = async () => {
    if (confirmPassword === password) {
      disableWalletExistsGuard?.();
      await createWallet(seedPhrase);
      await changePassword('', password);
      navigate('/wallet-success/create', { replace: true });
    } else {
      setError(t('CONFIRM_PASSWORD_MATCH_ERROR'));
    }
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
      <PasswordContainer>
        {currentStepIndex === 0 ? (
          <PasswordInput
            title={t('CREATE_PASSWORD_TITLE')}
            inputLabel={t('TEXT_INPUT_NEW_PASSWORD_LABEL')}
            enteredPassword={password}
            setEnteredPassword={setPassword}
            handleContinue={handleContinuePasswordCreation}
            handleBack={handleNewPasswordBack}
            checkPasswordStrength
            createPasswordFlow
          />
        ) : (
          <PasswordInput
            title={t('CONFIRM_PASSWORD_TITLE')}
            inputLabel={t('TEXT_INPUT_CONFIRM_PASSWORD_LABEL')}
            enteredPassword={confirmPassword}
            setEnteredPassword={setConfirmPassword}
            handleContinue={handleConfirmPassword}
            handleBack={handleConfirmPasswordBack}
            passwordError={error}
          />
        )}
      </PasswordContainer>
    </Container>
  );
}

export default CreatePassword;
