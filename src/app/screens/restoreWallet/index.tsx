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
  marginTop: props.theme.space.xs,
  flex: '1 0 auto',
}));

function RestoreWallet(): JSX.Element {
  const { t } = useTranslation('translation');
  const { restoreWallet, changeBtcPaymentAddressType } = useWalletReducer();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [password, setPassword] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [seedError, setSeedError] = useState('');
  const [btcPayAddressType, setBtcPayAddressType] = useState<BtcPaymentType>('native');
  const navigate = useNavigate();
  const { disableWalletExistsGuard } = useWalletExistsContext();

  const cleanMnemonic = (rawSeed: string): string =>
    rawSeed.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim();

  const onConfirmPasswordContinue = (validatedPassword: string) => {
    setPassword(validatedPassword);
    setCurrentStepIndex(1);
  };

  const onSeedPhraseContinue = async () => {
    const mnemonic = cleanMnemonic(seedPhrase);
    if (bip39.validateMnemonic(mnemonic)) {
      setSeedError('');

      disableWalletExistsGuard?.();

      // TODO multiwallet: make derivation type configurable depending on restore type
      // for now we are hardcoding to "index" derivation as that's what Xverse classically used
      await restoreWallet(mnemonic, password, 'index');

      // restoreWallet clears chrome storage, so we call this for react-persist to persist the state again
      changeBtcPaymentAddressType(btcPayAddressType);

      // vault is initialized, clear the seed and password from memory
      setSeedPhrase('');
      setPassword('');

      setCurrentStepIndex(2);
    } else {
      setSeedError(t('RESTORE_WALLET_SCREEN.SEED_INPUT_ERROR'));
    }
  };

  const handleSelectedTypeChange = (addressType: BtcPaymentType) => {
    changeBtcPaymentAddressType(addressType);
    setBtcPayAddressType(addressType);
  };

  const onAccountTypeContinue = () => {
    navigate('/wallet-success/restore', { replace: true });
  };

  const restoreSteps = [
    <PasswordContainer key="password">
      <CreatePassword handleContinue={onConfirmPasswordContinue} checkPasswordStrength />
    </PasswordContainer>,
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
      selectedType={btcPayAddressType}
      onSelectedTypeChange={handleSelectedTypeChange}
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
