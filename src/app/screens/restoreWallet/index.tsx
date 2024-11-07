import Dots from '@components/dots';
import { useWalletExistsContext } from '@components/guards/onboarding';
import PasswordInput from '@components/passwordInput';
import useWalletReducer from '@hooks/useWalletReducer';
import type { BtcPaymentType } from '@secretkeylabs/xverse-core';
import * as bip39 from 'bip39';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import EnterSeedPhrase from './enterSeedphrase';
import PaymentAddressTypeSelector from './paymentAddressTypeSelector';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: props.theme.space.m,
  paddingBottom: 0,
  overflowY: 'auto',
}));

const PasswordContainer = styled.div((props) => ({
  display: 'flex',
  width: '100%',
  height: '100%',
  marginBottom: props.theme.space.xxxl,
  marginTop: props.theme.space.xxxl,
}));

function RestoreWallet(): JSX.Element {
  const { t } = useTranslation('translation');
  const { restoreWallet, changeBtcPaymentAddressType } = useWalletReducer();
  const [isRestoring, setIsRestoring] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [seedError, setSeedError] = useState('');
  const [error, setError] = useState('');
  const [btcPayAddressType, setBtcPayAddressType] = useState<BtcPaymentType>('native');
  const navigate = useNavigate();
  const { disableWalletExistsGuard } = useWalletExistsContext();

  const cleanMnemonic = (rawSeed: string): string =>
    rawSeed.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim();

  const onSeedPhraseContinue = () => {
    const seed = cleanMnemonic(seedPhrase);
    if (bip39.validateMnemonic(seed)) {
      setSeedError('');
      setCurrentStepIndex(1);
    } else {
      setSeedError(t('RESTORE_WALLET_SCREEN.SEED_INPUT_ERROR'));
    }
  };

  const onAccountTypeContinue = () => {
    setCurrentStepIndex(2);
  };

  const onNewPasswordBack = () => {
    setCurrentStepIndex(1);
  };

  const onNewPasswordContinue = () => {
    setCurrentStepIndex(3);
  };

  const handleConfirmPasswordBack = () => {
    setCurrentStepIndex(2);
  };

  const onConfirmPasswordContinue = async () => {
    setIsRestoring(true);
    if (confirmPassword === password) {
      setError('');

      disableWalletExistsGuard?.();

      const seed = cleanMnemonic(seedPhrase);
      await restoreWallet(seed, password);
      setIsRestoring(false);

      changeBtcPaymentAddressType(btcPayAddressType);

      navigate('/wallet-success/restore', { replace: true });
    } else {
      setIsRestoring(false);
      setError(t('CREATE_PASSWORD_SCREEN.CONFIRM_PASSWORD_MATCH_ERROR'));
    }
  };

  const restoreSteps = [
    <EnterSeedPhrase
      key="seed"
      seed={seedPhrase}
      setSeed={setSeedPhrase}
      onContinue={onSeedPhraseContinue}
      seedError={seedError}
      setSeedError={setSeedError}
    />,
    <PaymentAddressTypeSelector
      key="addressType"
      seedPhrase={seedPhrase}
      selectedType={btcPayAddressType}
      onSelectedTypeChange={setBtcPayAddressType}
      onContinue={onAccountTypeContinue}
    />,
    <PasswordContainer key="password">
      <PasswordInput
        title={t('CREATE_PASSWORD_SCREEN.CREATE_PASSWORD_TITLE')}
        inputLabel={t('CREATE_PASSWORD_SCREEN.TEXT_INPUT_NEW_PASSWORD_LABEL')}
        enteredPassword={password}
        setEnteredPassword={setPassword}
        handleContinue={onNewPasswordContinue}
        handleBack={onNewPasswordBack}
        checkPasswordStrength
        autoFocus
      />
    </PasswordContainer>,
    <PasswordContainer key="confirmPassword">
      <PasswordInput
        title={t('CREATE_PASSWORD_SCREEN.CONFIRM_PASSWORD_TITLE')}
        inputLabel={t('CREATE_PASSWORD_SCREEN.TEXT_INPUT_NEW_PASSWORD_LABEL')}
        enteredPassword={confirmPassword}
        setEnteredPassword={setConfirmPassword}
        handleContinue={onConfirmPasswordContinue}
        handleBack={handleConfirmPasswordBack}
        passwordError={error}
        loading={isRestoring}
        autoFocus
      />
    </PasswordContainer>,
  ];

  return (
    <Container>
      <Dots numDots={restoreSteps.length} activeIndex={currentStepIndex} />
      {restoreSteps[currentStepIndex]}
    </Container>
  );
}

export default RestoreWallet;
