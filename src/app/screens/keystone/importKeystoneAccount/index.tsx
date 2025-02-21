import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { useTransition } from '@react-spring/web';
import {
  getMasterFingerPrintFromKeystone,
  importNativeSegwitAccountFromKeystone,
  importTaprootAccountFromKeystone,
  type Account,
  type KeystoneTransport,
} from '@secretkeylabs/xverse-core';
import { DEFAULT_TRANSITION_OPTIONS } from '@utils/constants';
import { validateAccountName } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StepControls from './stepControls';
import Steps from './steps';
import { ImportKeystoneSteps } from './types';

import { getKeystoneDeviceNewAccountIndex, getNewAccountId } from '@common/utils/keystone';
import { delay } from '@common/utils/promises';
import useGetAllAccounts from '@hooks/useGetAllAccounts';
import { createKeystoneTransport } from '@keystonehq/hw-transport-webusb';
import { Container, OnBoardingActionsContainer, OnBoardingContentContainer } from './index.styled';

interface Credential {
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
  const { keystoneAccountsList, network } = useWalletSelector();
  const transition = useTransition(currentStep, DEFAULT_TRANSITION_OPTIONS);
  const allAccounts = useGetAllAccounts();

  const importBtcAccounts = async (transport: KeystoneTransport, masterFingerPrint?: string) => {
    let btcCreds: {
      address: string;
      publicKey: string;
      xpub: string;
    };
    let ordinalsCreds: {
      address: string;
      publicKey: string;
      xpub: string;
    };

    const newAccountId = getNewAccountId(keystoneAccountsList);
    setAccountId(newAccountId);
    const deviceAccountIndex = getKeystoneDeviceNewAccountIndex(
      keystoneAccountsList,
      network.type,
      masterPubKey || masterFingerPrint,
    );

    const keystoneImportErrorMessages = {
      disconnect: importScreenTranslate('KEYSTONE_CONNECT.BTC_SUBTITLE_PAGE_FAILED'),
      4: importScreenTranslate('KEYSTONE_CONNECT.BTC_SUBTITLE_REJECT_FAILED'),
      6: importScreenTranslate('KEYSTONE_CONNECT.BTC_SUBTITLE_PAGE_FAILED'),
    };

    try {
      btcCreds = await importNativeSegwitAccountFromKeystone({
        transport,
        addressIndex: deviceAccountIndex,
        network: 'Mainnet', // keystone only supports mainnet for now
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

    try {
      ordinalsCreds = await importTaprootAccountFromKeystone({
        transport,
        addressIndex: deviceAccountIndex,
        network: 'Mainnet', // keystone only supports mainnet for now
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

    return { btcCreds, ordinalsCreds, newAccountId, deviceAccountIndex };
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
    deviceAccountIndex,
  }: {
    btcCreds?: Credential;
    ordinalsCreds?: Credential;
    stacksCreds?: Credential;
    masterFingerPrint: string;
    newAccountId: number;
    deviceAccountIndex: number;
  }) => {
    setIsButtonDisabled(true);
    const currentAccount = keystoneAccountsList.find(
      (account) =>
        account.deviceAccountIndex === deviceAccountIndex &&
        account.masterPubKey === masterFingerPrint,
    );

    try {
      if (!currentAccount) {
        const keystoneAccount: Account = {
          id: newAccountId,
          stxAddress: stacksCreds?.address || '',
          btcAddresses: {
            native: {
              address: btcCreds?.address || '',
              publicKey: btcCreds?.publicKey || '',
              xpub: btcCreds?.xpub,
            },
            taproot: {
              address: ordinalsCreds?.address || '',
              publicKey: ordinalsCreds?.publicKey || '',
              xpub: ordinalsCreds?.xpub,
            },
          },
          masterPubKey: masterFingerPrint,
          stxPublicKey: stacksCreds?.publicKey || '',
          accountType: 'keystone',
          accountName: `Keystone Account ${newAccountId + 1}`,
          deviceAccountIndex,
        };
        await addKeystoneAccount(keystoneAccount);
        await delay(1000);
        setCurrentStep(ImportKeystoneSteps.ADDRESS_ADDED);
        return;
      }

      const keystoneAccount: Account = {
        ...currentAccount,
        btcAddresses: {
          native: {
            address: btcCreds?.address || '',
            publicKey: btcCreds?.publicKey || '',
          },
          taproot: {
            address: ordinalsCreds?.address || '',
            publicKey: ordinalsCreds?.publicKey || '',
          },
        },
      };
      await updateKeystoneAccounts(keystoneAccount);
      await delay(1000);
      setCurrentStep(ImportKeystoneSteps.ADDRESS_ADDED);
    } catch (err) {
      console.error(err);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const fetchMasterPubKey = async (transport: KeystoneTransport) => {
    const masterFingerPrint = await getMasterFingerPrintFromKeystone(transport);
    setMasterPubKey(masterFingerPrint);
    return masterFingerPrint;
  };

  const onConnect = async () => {
    try {
      setIsConnectFailed(false);
      setConnectFailedText('');
      setIsButtonDisabled(true);

      const transport = await createKeystoneTransport();
      const masterFingerPrint = await fetchMasterPubKey(transport);
      const importedBtcAccounts = await importBtcAccounts(transport, masterFingerPrint);

      setIsConnectSuccess(true);

      if (!importedBtcAccounts) {
        throw new Error('No accounts');
      }

      const { btcCreds, ordinalsCreds, newAccountId, deviceAccountIndex } = importedBtcAccounts;
      await saveAddressToWallet({
        btcCreds,
        ordinalsCreds,
        masterFingerPrint,
        newAccountId,
        deviceAccountIndex,
      });
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

    const validationError = validateAccountName(accountName, t, allAccounts);
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

  return (
    <Container>
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
              onConnect={onConnect}
              handleClickNext={handleClickNext}
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
