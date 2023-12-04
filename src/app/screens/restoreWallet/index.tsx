import { useWalletExistsContext } from '@components/guards/onboarding';
import PasswordInput from '@components/passwordInput';
import Steps from '@components/steps';
import useWalletReducer from '@hooks/useWalletReducer';
import * as bip39 from 'bip39';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import EnterSeedPhrase from './enterSeedphrase';

const Body = styled.div(() => ({
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'flex-start',
  margin: '60px 0',
}));

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'auto',
  backgroundColor: props.theme.colors.elevation0,
  padding: `${props.theme.spacing(12)}px`,
  border: `1px solid ${props.theme.colors.elevation2}`,
  borderRadius: props.theme.radius(2),
}));

const PasswordContainer = styled.div((props) => ({
  display: 'flex',
  height: '100%',
  width: '312px',
  marginBottom: props.theme.spacing(32),
  marginTop: props.theme.spacing(32),
}));

function RestoreWallet(): JSX.Element {
  const { t } = useTranslation('translation');
  const { restoreWallet } = useWalletReducer();
  const [isRestoring, setIsRestoring] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [seedError, setSeedError] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { disableWalletExistsGuard } = useWalletExistsContext();

  const cleanMnemonic = (rawSeed: string): string =>
    rawSeed.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim();

  const handleNewPasswordBack = () => {
    setCurrentStepIndex(0);
  };

  const handleConfirmPasswordBack = () => {
    setCurrentStepIndex(1);
  };

  function validateMnemonic(seed: string) {
    if (bip39.validateMnemonic(seed)) {
      return true;
    }
    return false;
  }

  const onSeedPhraseContinue = () => {
    const seed = cleanMnemonic(seedPhrase);
    if (validateMnemonic(seed)) {
      setSeedError('');
      setCurrentStepIndex(1);
    } else {
      setSeedError(t('RESTORE_WALLET_SCREEN.SEED_INPUT_ERROR'));
    }
  };

  const handleContinuePasswordCreation = () => {
    setCurrentStepIndex(2);
  };

  const handleConfirmPassword = async () => {
    setIsRestoring(true);
    if (confirmPassword === password) {
      setError('');

      disableWalletExistsGuard?.();

      const seed = cleanMnemonic(seedPhrase);
      await restoreWallet(seed, password);
      setIsRestoring(false);

      navigate('/wallet-success/restore', { replace: true });
    } else {
      setIsRestoring(false);
      setError(t('CREATE_PASSWORD_SCREEN.CONFIRM_PASSWORD_MATCH_ERROR'));
    }
  };

  const restoreSteps = [
    <EnterSeedPhrase
      seed={seedPhrase}
      setSeed={setSeedPhrase}
      onContinue={onSeedPhraseContinue}
      seedError={seedError}
      setSeedError={setSeedError}
    />,
    <PasswordContainer>
      <PasswordInput
        title={t('CREATE_PASSWORD_SCREEN.CREATE_PASSWORD_TITLE')}
        inputLabel={t('CREATE_PASSWORD_SCREEN.TEXT_INPUT_NEW_PASSWORD_LABEL')}
        enteredPassword={password}
        setEnteredPassword={setPassword}
        handleContinue={handleContinuePasswordCreation}
        handleBack={handleNewPasswordBack}
        checkPasswordStrength
        createPasswordFlow
      />
    </PasswordContainer>,
    <PasswordContainer>
      <PasswordInput
        title={t('CREATE_PASSWORD_SCREEN.CONFIRM_PASSWORD_TITLE')}
        inputLabel={t('CREATE_PASSWORD_SCREEN.TEXT_INPUT_NEW_PASSWORD_LABEL')}
        enteredPassword={confirmPassword}
        setEnteredPassword={setConfirmPassword}
        handleContinue={handleConfirmPassword}
        handleBack={handleConfirmPasswordBack}
        passwordError={error}
        loading={isRestoring}
      />
    </PasswordContainer>,
  ];
  return (
    <Body>
      <Container>
        <Steps data={restoreSteps} activeIndex={currentStepIndex} />
        {restoreSteps[currentStepIndex]}
      </Container>
    </Body>
  );
}

export default RestoreWallet;
