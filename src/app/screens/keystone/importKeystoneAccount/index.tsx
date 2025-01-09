import FullScreenHeader from '@components/keystone/fullScreenHeader';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { useTransition } from '@react-spring/web';
import {
  getMasterFingerPrintFromKeystone,
  importNativeSegwitAccountFromKeystone,
  importTaprootAccountFromKeystone,
  type Account,
} from '@secretkeylabs/xverse-core';
import { DEFAULT_TRANSITION_OPTIONS } from '@utils/constants';
import { validateAccountName } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StepControls from './stepControls';
import Steps from './steps';
import { ImportKeystoneSteps } from './types';

import { createKeystoneTransport } from '@keystonehq/hw-transport-webusb';
import { delay, getKeystoneDeviceNewAccountIndex, getNewAccountId } from '@utils/account';
import { Container, OnBoardingActionsContainer, OnBoardingContentContainer } from './index.styled';

export interface Credential {
  xpub: string;
  publicKey: string;
  address: string;
}

function ImportKeystone(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(ImportKeystoneSteps.START);
  const [masterPubKey, setMasterPubKey] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [accountId, setAccountId] = useState(0);
  const [accountName, setAccountName] = useState('');
  const [accountNameError, setAccountNameError] = useState<string | undefined>();
  const [connectFailedText, setConnectFailedText] = useState('');
  const { t } = useTranslation('translation', {
    keyPrefix: 'OPTIONS_DIALOG',
  });
  const { t: importScreenTranslate } = useTranslation('translation', {
    keyPrefix: 'KEYSTONE_IMPORT_SCREEN',
  });

  const { addKeystoneAccount, updateKeystoneAccounts } = useWalletReducer();
  const { accountsList, keystoneAccountsList, network } = useWalletSelector();
  const transition = useTransition(currentStep, DEFAULT_TRANSITION_OPTIONS);

  const importBtcAccounts = async (masterFingerPrint?: string) => {
    let btcCreds;
    let ordinalsCreds;

    const newAccountId = getNewAccountId(keystoneAccountsList);
    setAccountId(newAccountId);
    const deviceNewAccountIndex = getKeystoneDeviceNewAccountIndex(
      keystoneAccountsList,
      network.type,
      masterPubKey || masterFingerPrint,
    );

    const transport = await createKeystoneTransport();

    const keystoneImportErrorMessages = {
      disconnect: importScreenTranslate('KEYSTONE_CONNECT.BTC_SUBTITLE_PAGE_FAILED'),
      4: importScreenTranslate('KEYSTONE_CONNECT.BTC_SUBTITLE_REJECT_FAILED'),
      6: importScreenTranslate('KEYSTONE_CONNECT.BTC_SUBTITLE_PAGE_FAILED'),
    };

    try {
      btcCreds = await importNativeSegwitAccountFromKeystone({
        transport,
        addressIndex: deviceNewAccountIndex,
      });
    } catch (err: any) {
      if ([4, 6].includes(err.transportErrorCode)) {
        setConnectFailedText(keystoneImportErrorMessages[err.transportErrorCode]);
        throw new Error(keystoneImportErrorMessages[err.transportErrorCode]);
      } else if (err.message.includes('The device was disconnected')) {
        setConnectFailedText(keystoneImportErrorMessages.disconnect);
        throw new Error(keystoneImportErrorMessages.disconnect);
      } else {
        setIsConnectFailed(true);
      }
      setIsButtonDisabled(false);
      await transport.close();
    }
    try {
      ordinalsCreds = await importTaprootAccountFromKeystone({
        transport,
        addressIndex: deviceNewAccountIndex,
      });
    } catch (err: any) {
      if ([4, 6].includes(err.transportErrorCode)) {
        setConnectFailedText(keystoneImportErrorMessages[err.transportErrorCode]);
        throw new Error(keystoneImportErrorMessages[err.transportErrorCode]);
      } else if (err.message.includes('The device was disconnected')) {
        setConnectFailedText(keystoneImportErrorMessages.disconnect);
        throw new Error(keystoneImportErrorMessages.disconnect);
      } else {
        setIsConnectFailed(true);
      }
      setIsButtonDisabled(false);
      await transport.close();
      return;
    }

    await transport.close();

    return { btcCreds, ordinalsCreds, newAccountId };
  };

  const handleClickNext = async () => {
    setCurrentStep((prevStepIndex) => prevStepIndex + 1);
  };

  const saveAddressToWallet = async ({
    btcCreds,
    ordinalsCreds,
    stacksCreds,
    masterFingerPrint,
    newAccountId,
  }: {
    btcCreds?: Credential;
    ordinalsCreds?: Credential;
    stacksCreds?: Credential;
    masterFingerPrint?: string;
    newAccountId: number;
  }) => {
    setIsButtonDisabled(true);
    const currentAccount = keystoneAccountsList.find(
      (account) =>
        account.id === newAccountId && account.masterPubKey === (masterPubKey || masterFingerPrint),
    );

    try {
      if (!currentAccount) {
        const keystoneAccount: Account = {
          id: newAccountId,
          stxAddress: stacksCreds?.address || '',
          btcAddress: btcCreds?.address || '',
          ordinalsAddress: ordinalsCreds?.address || '',
          masterPubKey: masterPubKey || masterFingerPrint || '',
          stxPublicKey: stacksCreds?.publicKey || '',
          btcPublicKey: btcCreds?.publicKey || '',
          ordinalsPublicKey: ordinalsCreds?.publicKey || '',
          btcXpub: btcCreds?.xpub || '',
          ordinalsXpub: ordinalsCreds?.xpub || '',
          accountType: 'keystone',
          accountName: `Keystone Account ${newAccountId + 1}`,
          deviceAccountIndex: getKeystoneDeviceNewAccountIndex(
            keystoneAccountsList,
            network.type,
            masterPubKey || masterFingerPrint,
          ),
        };
        await addKeystoneAccount(keystoneAccount);
        await delay(1000);
        setCurrentStep(ImportKeystoneSteps.ADDRESS_ADDED);
        setIsButtonDisabled(false);
        return;
      }

      if (currentAccount) {
        const keystoneAccount: Account = {
          ...currentAccount,
          btcAddress: btcCreds?.address || '',
          btcPublicKey: btcCreds?.publicKey || '',
          ordinalsAddress: ordinalsCreds?.address || '',
          ordinalsPublicKey: ordinalsCreds?.publicKey || '',
          btcXpub: btcCreds?.xpub || '',
          ordinalsXpub: ordinalsCreds?.xpub || '',
        };
        await updateKeystoneAccounts(keystoneAccount);
        await delay(1000);
        setCurrentStep(ImportKeystoneSteps.ADDRESS_ADDED);
        setIsButtonDisabled(false);
        return;
      }

      await delay(500);
      setIsButtonDisabled(false);
    } catch (err) {
      console.error(err);
      setIsButtonDisabled(false);
    }
  };

  const handleClickMultipleAccounts = async () => {
    try {
      setIsButtonDisabled(true);

      const importedBtcAccounts = await importBtcAccounts();
      if (!importedBtcAccounts) {
        throw new Error('No accounts');
      }
      const { btcCreds, ordinalsCreds, newAccountId } = importedBtcAccounts;
      await saveAddressToWallet({ btcCreds, ordinalsCreds, newAccountId });
    } catch (err) {
      console.error(err);
      setIsButtonDisabled(false);
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    }
  };

  const fetchMasterPubKey = async () => {
    const transport = await createKeystoneTransport();

    const masterFingerPrint = await getMasterFingerPrintFromKeystone(transport);
    setMasterPubKey(masterFingerPrint);
    return masterFingerPrint;
  };

  const checkDeviceConnection = async () => {
    try {
      setIsConnectFailed(false);
      setConnectFailedText('');
      setIsButtonDisabled(true);

      const masterFingerPrint = await fetchMasterPubKey();
      await importBtcAccounts(masterFingerPrint);
      setIsConnectSuccess(true);
      await delay(1500);
      if (keystoneAccountsList?.find((account) => account.masterPubKey === masterFingerPrint)) {
        setIsButtonDisabled(false);
        setCurrentStep(ImportKeystoneSteps.ADD_MULTIPLE_ACCOUNTS);
        return;
      }
      handleClickNext();
      const importedBtcAccounts = await importBtcAccounts(masterFingerPrint);
      if (!importedBtcAccounts) {
        throw new Error('No accounts');
      }
      const { btcCreds, ordinalsCreds, newAccountId } = importedBtcAccounts;
      await saveAddressToWallet({ btcCreds, ordinalsCreds, masterFingerPrint, newAccountId });
    } catch (err) {
      setIsButtonDisabled(false);
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    }
  };

  const updateAccountName = async () => {
    if (accountName === '') {
      handleClickNext();
      return;
    }

    const validationError = validateAccountName(accountName, t, accountsList, keystoneAccountsList);
    if (validationError) {
      setAccountNameError(validationError);
      return;
    }

    try {
      setIsButtonDisabled(true);
      const accountToUpdate = keystoneAccountsList.find(
        (account) => account.id === accountId && account.masterPubKey === masterPubKey,
      );
      if (!accountToUpdate) {
        throw new Error('Account not found');
      }
      const updatedAccount: Account = { ...accountToUpdate, accountName };
      await updateKeystoneAccounts(updatedAccount);
      await delay(1000);
      handleClickNext();
    } catch (err) {
      console.error(err);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const backToAssetSelection = () => {
    setIsButtonDisabled(false);
    setIsConnectSuccess(false);
    setIsConnectFailed(false);
    setAccountName('');
    setAccountId(0);
    setCurrentStep(ImportKeystoneSteps.START);
  };

  return (
    <Container>
      <FullScreenHeader />
      {transition((style) => (
        <>
          <OnBoardingContentContainer
            className={
              [
                ImportKeystoneSteps.START,
                ImportKeystoneSteps.CONNECT_KEYSTONE,
                ImportKeystoneSteps.ADDRESS_ADDED,
                ImportKeystoneSteps.IMPORT_END,
              ].includes(currentStep)
                ? 'center'
                : ''
            }
            style={style}
          >
            <Steps
              isConnectSuccess={isConnectSuccess}
              currentStep={currentStep}
              accountName={accountName}
              accountId={accountId}
              setAccountName={setAccountName}
              errors={{
                isConnectFailed,
                connectFailedText,
                accountNameError,
              }}
            />
          </OnBoardingContentContainer>
          <OnBoardingActionsContainer>
            <StepControls
              isButtonDisabled={isButtonDisabled}
              currentStep={currentStep}
              checkDeviceConnection={checkDeviceConnection}
              handleClickNext={handleClickNext}
              handleClickMultipleAccounts={handleClickMultipleAccounts}
              backToAssetSelection={backToAssetSelection}
              updateAccountName={updateAccountName}
              errors={{
                isConnectFailed,
              }}
            />
          </OnBoardingActionsContainer>
        </>
      ))}
    </Container>
  );
}

export default ImportKeystone;
