import * as bip39 from 'bip39';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ConfirmPassword from '@screens/createPassword/confirmPassword';
import NewPassword from '@screens/createPassword/newPassword';
import { useTranslation } from 'react-i18next';
import useWalletReducer from '@hooks/useWalletReducer';
import Steps from '@components/steps';
import EnterSeedPhrase from './enterSeedphrase';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: props.theme.colors.background.elevation0,
  padding: `${props.theme.spacing(12)}px ${props.theme.spacing(8)}px 0 ${props.theme.spacing(8)}px`,
}));

function RestoreWallet(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_WALLET_SCREEN' });
  const {
    restoreWallet,
  } = useWalletReducer();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [seedError, setSeedError] = useState<string>('');
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
      setSeedError(t('SEED_INPUT_ERROR'));
    }
  };

  const handleContinuePasswordCreation = () => {
    setCurrentStepIndex(2);
  };

  const handleConfirmPassword = async () => {
    try {
      const seed = cleanMnemonic(seedPhrase);
      await restoreWallet(seed, password);
      navigate('/create-wallet-success');
    } catch (err) {
      console.log(err);
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
    <NewPassword
      password={password}
      setPassword={setPassword}
      handleContinue={handleContinuePasswordCreation}
      handleBack={handleNewPasswordBack}
    />,
    <ConfirmPassword
      password={password}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      handleContinue={handleConfirmPassword}
      handleBack={handleConfirmPasswordBack}

    />,
  ];
  return (
    <Container>
      <Steps data={restoreSteps} activeIndex={currentStepIndex} />
      {restoreSteps[currentStepIndex]}
    </Container>
  );
}

export default RestoreWallet;
