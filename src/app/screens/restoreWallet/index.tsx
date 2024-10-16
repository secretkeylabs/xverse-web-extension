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
  const { restoreWallet, enableNestedSegWitAddress, changeBtcPaymentAddressType } =
    useWalletReducer();
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

      // we allow the user to switch between address types if restoring the wallet
      // this disabled by default for new wallets
      enableNestedSegWitAddress();
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
        createPasswordFlow
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
    <Body>
      <Container>
        <Dots numDots={restoreSteps.length} activeIndex={currentStepIndex} />
        {restoreSteps[currentStepIndex]}
      </Container>
    </Body>
  );
}

export default RestoreWallet;
