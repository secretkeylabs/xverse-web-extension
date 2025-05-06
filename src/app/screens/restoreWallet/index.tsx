import CreatePassword from '@components/createPassword';
import { useWalletExistsContext } from '@components/guards/onboarding';
import useBtcClient from '@hooks/apiClients/useBtcClient';
import useStacksAPI from '@hooks/apiClients/useStacksApi';
import useTabUnloadBlocker from '@hooks/useTabUnloadBlocker';
import useWalletReducer from '@hooks/useWalletReducer';
import * as bip32 from '@scure/bip32';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import {
  getAccountBalanceSummary,
  type BtcPaymentType,
  type DerivationType,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import DerivationTypeSelector from './derivationTypeSelector';
import EnterSeedPhrase from './enterSeedphrase';
import OtherWalletSelector from './otherWalletSelector';
import PaymentAddressTypeSelector from './paymentAddressTypeSelector';
import RestoreMethodSelector from './restoreMethodSelector';
import type { RestoreMethod } from './types';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `${props.theme.space.l} ${props.theme.space.m} 0`,
  ...props.theme.scrollbar,
}));

const PasswordContainer = styled.div((props) => ({
  display: 'flex',
  width: '100%',
  paddingTop: props.theme.space.m,
  flex: '1 0 auto',
}));

enum RestoreWalletStep {
  PASSWORD = 0,
  // TODO: We skip the METHOD_SELECTOR screen until we add more restore methods like private key, etc.
  METHOD_SELECTOR = 1,
  OTHER_WALLET = 2,
  SEED_PHRASE = 3,
  DERIVATION_TYPE = 4,
  PAYMENT_ADDRESS_TYPE = 5,
}

function RestoreWallet(): JSX.Element {
  const { t } = useTranslation('translation');
  const { restoreWallet, changeBtcPaymentAddressType } = useWalletReducer();
  const [currentStepIndex, setCurrentStepIndex] = useState(RestoreWalletStep.PASSWORD);
  const [password, setPassword] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [seedError, setSeedError] = useState('');
  const [restoreMethod, setRestoreMethod] = useState<RestoreMethod | undefined>('wallet');
  const [btcPayAddressType, setBtcPayAddressType] = useState<BtcPaymentType>('native');
  const [derivationType, setDerivationType] = useState<DerivationType>('index');
  const [showDerivationTypeScreen, setShowDerivationTypeScreen] = useState(true);
  const [autoDetectDerivationType, setAutoDetectDerivationType] = useState(false);
  const [initialShow24Words, setInitialShow24Words] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const navigate = useNavigate();
  const { disableWalletExistsGuard } = useWalletExistsContext();
  const btcClient = useBtcClient();
  const stxClient = useStacksAPI();

  useTabUnloadBlocker();

  const cleanMnemonic = (rawSeed: string): string =>
    rawSeed.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim();

  const {
    data: walletSummaryData,
    isPending: walletSummaryIsLoading,
    refetch: fetchWalletSummaryData,
  } = useQuery({
    // Some dependencies are missing, which is not ideal, although they are not
    // JSON-serializable or are sensitive (private key). Hopefully when the App
    // API gets implemented, this entire block of logic can be moved there.
    //
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['wallet-summary'],
    queryFn: async () => {
      const mnemonic = cleanMnemonic(seedPhrase);
      if (!bip39.validateMnemonic(mnemonic, wordlist)) {
        throw new Error('Invalid seed phrase');
      }

      const seed = await bip39.mnemonicToSeed(mnemonic);
      const rootNode = bip32.HDKey.fromMasterSeed(seed);
      const [accountSummary, indexSummary] = await Promise.all([
        getAccountBalanceSummary({
          btcClient,
          stxClient,
          rootNode,
          derivationType: 'account',
          network: 'Mainnet',
          limit: 10,
        }),
        getAccountBalanceSummary({
          btcClient,
          stxClient,
          rootNode,
          derivationType: 'index',
          network: 'Mainnet',
          limit: 10,
        }),
      ]);

      return { accountSummary, indexSummary };
    },
    // this is disabled because we only want to fire it once there is a seed is set
    enabled: false,
    gcTime: 0,
  });

  const {
    data: derivationSummaryData,
    isLoading: derivationSummaryIsLoading,
    refetch: fetchDerivationSummaryData,
  } = useQuery({
    // Some dependencies are missing, which is not ideal, although they are not
    // JSON-serializable or are sensitive (private key). Hopefully when the App
    // API gets implemented, this entire block of logic can be moved there.
    //
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['derivation-summary'],
    queryFn: async () => {
      const mnemonic = cleanMnemonic(seedPhrase);
      if (!bip39.validateMnemonic(mnemonic, wordlist)) {
        throw new Error('Invalid seed phrase');
      }

      const seed = await bip39.mnemonicToSeed(mnemonic);
      const rootNode = bip32.HDKey.fromMasterSeed(seed);
      const summary = await getAccountBalanceSummary({
        btcClient,
        stxClient,
        rootNode,
        derivationType,
        network: 'Mainnet',
        limit: 10,
      });

      return summary;
    },
    // this is disabled because we only want to fire it once there is a seed is set
    enabled: false,
    gcTime: 0,
  });

  const onConfirmPasswordContinue = (validatedPassword: string) => {
    setPassword(validatedPassword);
    // TODO: Should be RestoreWalletStep.METHOD_SELECTOR when we use that screen
    setCurrentStepIndex(RestoreWalletStep.OTHER_WALLET);
  };

  const onMethodChoiceBack = () => {
    setCurrentStepIndex(RestoreWalletStep.PASSWORD);
  };

  const onMethodChoiceContinue = async (methodChoice: RestoreMethod) => {
    setRestoreMethod(methodChoice);
    if (methodChoice === 'wallet') {
      setCurrentStepIndex(RestoreWalletStep.OTHER_WALLET);
    } else {
      setCurrentStepIndex(RestoreWalletStep.SEED_PHRASE);
    }
  };

  const onRestoreWalletFromOtherWalletBack = () => {
    // TODO: Should be RestoreWalletStep.METHOD_SELECTOR when we use that screen
    setCurrentStepIndex(RestoreWalletStep.PASSWORD);
  };

  const onRestoreWalletFromOtherWalletContinue = async ({
    sourceWalletDerivationType,
    autoDetect = false,
    show24Words = false,
  }: {
    sourceWalletDerivationType: DerivationType;
    autoDetect?: boolean;
    show24Words?: boolean;
  }) => {
    setDerivationType(sourceWalletDerivationType);
    setAutoDetectDerivationType(autoDetect);
    setShowDerivationTypeScreen(autoDetect);
    setCurrentStepIndex(RestoreWalletStep.SEED_PHRASE);
    setInitialShow24Words(show24Words);
  };

  const onSeedPhraseBack = () => {
    if (restoreMethod === 'wallet') {
      setCurrentStepIndex(RestoreWalletStep.OTHER_WALLET);
    }
    if (restoreMethod === 'seed') {
      setCurrentStepIndex(RestoreWalletStep.METHOD_SELECTOR);
    }
  };

  const initialiseWallet = async (
    validatedMnemonic: string,
    selectedPassword: string,
    selectedDerivationType: DerivationType,
  ) => {
    setCreatingWallet(true);
    setSeedError('');

    disableWalletExistsGuard?.();

    await restoreWallet(validatedMnemonic, selectedPassword, selectedDerivationType);

    // restoreWallet clears chrome storage, so we call this for react-persist to persist the state again
    await changeBtcPaymentAddressType(btcPayAddressType);

    // vault is initialized, clear the seed and password from memory
    setSeedPhrase('');
    setPassword('');

    if (showDerivationTypeScreen) {
      setCurrentStepIndex(RestoreWalletStep.DERIVATION_TYPE);
    } else {
      setCurrentStepIndex(RestoreWalletStep.PAYMENT_ADDRESS_TYPE);
    }
    setCreatingWallet(false);
  };

  const onSeedPhraseContinue = async () => {
    const mnemonic = cleanMnemonic(seedPhrase);
    if (bip39.validateMnemonic(mnemonic, wordlist)) {
      if (showDerivationTypeScreen) {
        fetchWalletSummaryData().catch(console.error);
        setCurrentStepIndex(RestoreWalletStep.DERIVATION_TYPE);
      } else {
        fetchDerivationSummaryData().catch(console.error);
        await initialiseWallet(mnemonic, password, derivationType);
        setCurrentStepIndex(RestoreWalletStep.PAYMENT_ADDRESS_TYPE);
      }
      setCreatingWallet(false);
    } else {
      setSeedError(t('RESTORE_WALLET_SCREEN.SEED_INPUT_ERROR'));
    }
  };

  const onDerivationTypeContinue = async (finalSelectedDerivationType: DerivationType) => {
    const mnemonic = cleanMnemonic(seedPhrase);
    await initialiseWallet(mnemonic, password, finalSelectedDerivationType);
    setCurrentStepIndex(RestoreWalletStep.PAYMENT_ADDRESS_TYPE);
    setDerivationType(finalSelectedDerivationType);
  };

  const handleSelectedAccountTypeChange = async (addressType: BtcPaymentType) => {
    await changeBtcPaymentAddressType(addressType);
    setBtcPayAddressType(addressType);
  };

  const onAccountTypeContinue = () => {
    navigate('/wallet-success/restore', { replace: true });
  };

  const addressTypeSummaryData = showDerivationTypeScreen
    ? derivationType === 'account'
      ? walletSummaryData?.accountSummary
      : walletSummaryData?.indexSummary
    : derivationSummaryData;
  const addressTypeSummaryLoading = showDerivationTypeScreen
    ? walletSummaryIsLoading
    : derivationSummaryIsLoading;

  const renderStep = () => {
    switch (currentStepIndex) {
      case RestoreWalletStep.PASSWORD:
        return (
          <PasswordContainer key="password">
            <CreatePassword handleContinue={onConfirmPasswordContinue} checkPasswordStrength />
          </PasswordContainer>
        );
      case RestoreWalletStep.METHOD_SELECTOR:
        return (
          <RestoreMethodSelector
            key="restoreMethod"
            onContinue={onMethodChoiceContinue}
            onBack={onMethodChoiceBack}
          />
        );
      case RestoreWalletStep.OTHER_WALLET:
        return (
          <OtherWalletSelector
            key="otherWallet"
            onContinue={onRestoreWalletFromOtherWalletContinue}
            onBack={onRestoreWalletFromOtherWalletBack}
          />
        );
      case RestoreWalletStep.SEED_PHRASE:
        return (
          <EnterSeedPhrase
            key="seed"
            seedPhrase={seedPhrase}
            onSeedChange={setSeedPhrase}
            onContinue={onSeedPhraseContinue}
            onBack={onSeedPhraseBack}
            seedError={seedError}
            setSeedError={setSeedError}
            creatingWallet={creatingWallet}
            initialShow24Words={initialShow24Words}
          />
        );
      case RestoreWalletStep.DERIVATION_TYPE:
        return (
          <DerivationTypeSelector
            key="derivationType"
            onContinue={onDerivationTypeContinue}
            summaryData={walletSummaryData}
            summaryIsLoading={walletSummaryIsLoading}
            autoDetectDerivationType={autoDetectDerivationType}
            preferredAutoDerivationType={derivationType}
          />
        );
      case RestoreWalletStep.PAYMENT_ADDRESS_TYPE:
        return (
          <PaymentAddressTypeSelector
            key="addressType"
            selectedType={btcPayAddressType}
            onSelectedTypeChange={handleSelectedAccountTypeChange}
            onContinue={onAccountTypeContinue}
            summaryData={addressTypeSummaryData}
            summaryIsLoading={addressTypeSummaryLoading}
          />
        );
      default:
        return null;
    }
  };

  return <Container>{renderStep()}</Container>;
}

export default RestoreWallet;
