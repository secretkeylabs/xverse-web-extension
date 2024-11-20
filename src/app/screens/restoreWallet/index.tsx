import CreatePassword from '@components/createPassword';
import Dots from '@components/dots';
import { useWalletExistsContext } from '@components/guards/onboarding';
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
  padding: `${props.theme.space.l} ${props.theme.space.m} 0`,
  overflowY: 'auto',
}));

const PasswordContainer = styled.div((props) => ({
  display: 'flex',
  width: '100%',
  height: '100%',
  marginTop: props.theme.space.xs,
  flex: '1 0 auto',
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

  const onConfirmPasswordContinue = async () => {
    setIsRestoring(true);
    if (confirmPassword === password) {
      setError('');

      disableWalletExistsGuard?.();

      const seed = cleanMnemonic(seedPhrase);
      await restoreWallet(seed, password);
      setIsRestoring(false);

      changeBtcPaymentAddressType(btcPayAddressType);

      setCurrentStepIndex(2);
    } else {
      setIsRestoring(false);
      setError(t('CREATE_PASSWORD_SCREEN.CONFIRM_PASSWORD_MATCH_ERROR'));
    }
  };

  const onAccountTypeContinue = () => {
    navigate('/wallet-success/restore', { replace: true });
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
    <PasswordContainer key="password">
      <CreatePassword
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        handleContinue={onConfirmPasswordContinue}
        loading={isRestoring}
        confirmPasswordError={error}
        checkPasswordStrength
      />
    </PasswordContainer>,
    <PaymentAddressTypeSelector
      key="addressType"
      seedPhrase={seedPhrase}
      selectedType={btcPayAddressType}
      onSelectedTypeChange={setBtcPayAddressType}
      onContinue={onAccountTypeContinue}
    />,
  ];

  return (
    <Container>
      <Dots numDots={restoreSteps.length} activeIndex={currentStepIndex} />
      {restoreSteps[currentStepIndex]}
    </Container>
  );
}

export default RestoreWallet;
