import * as bip39 from 'bip39';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useWalletReducer from '@hooks/useWalletReducer';
import Steps from '@components/steps';
import PasswordInput from '@components/passwordInput';
import EnterSeedPhrase from './enterSeedphrase';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: props.theme.colors.background.elevation0,
  padding: `${props.theme.spacing(12)}px ${props.theme.spacing(8)}px 0 ${props.theme.spacing(8)}px`,
}));

const PasswordContainer = styled.div((props) => ({
  display: 'flex',
  height: '100%',
  marginBottom: props.theme.spacing(15),
}));

function RestoreWallet(): JSX.Element {
  const { t } = useTranslation('translation');
  const { restoreWallet } = useWalletReducer();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [seedError, setSeedError] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const cleanMnemonic = (rawSeed: string): string => rawSeed.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim();

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
    if (confirmPassword === password) {
      setError('');
      const seed = cleanMnemonic(seedPhrase);
      await restoreWallet(seed, password);
      navigate('/create-wallet-success');
    } else {
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
      />
    </PasswordContainer>,
    <PasswordContainer>
      <PasswordInput
        title={t('CREATE_PASSWORD_SCREEN.CONFIRM_PASSWORD_TITLE')}
        inputLabel={t('CREATE_PASSWORD_SCREEN.TEXT_INPUT_CONFIRM_PASSWORD_LABEL')}
        enteredPassword={confirmPassword}
        setEnteredPassword={setConfirmPassword}
        handleContinue={handleConfirmPassword}
        handleBack={handleConfirmPasswordBack}
        passwordError={error}
      />
    </PasswordContainer>,

  ];
  return (
    <Container>
      <Steps data={restoreSteps} activeIndex={currentStepIndex} />
      {restoreSteps[currentStepIndex]}
    </Container>
  );
}

export default RestoreWallet;
