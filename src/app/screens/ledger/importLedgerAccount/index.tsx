import { getDeviceNewAccountIndex, getNewAccountId } from '@common/utils/ledger';
import { delay } from '@common/utils/promises';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { useTransition } from '@react-spring/web';
import {
  LedgerErrors,
  getMasterFingerPrint,
  importNativeSegwitAccountFromLedger,
  importStacksAccountFromLedger,
  importTaprootAccountFromLedger,
  type Account,
} from '@secretkeylabs/xverse-core';
import { DEFAULT_TRANSITION_OPTIONS } from '@utils/constants';
import { validateAccountName } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StepControls from './stepControls';
import Steps from './steps';
import { ImportLedgerSteps, LedgerLiveOptions } from './types';

import useGetAllAccounts from '@hooks/useGetAllAccounts';
import { Container, OnBoardingActionsContainer, OnBoardingContentContainer } from './index.styled';

export interface Credential {
  publicKey: string;
  address: string;
}

function ImportLedger(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(ImportLedgerSteps.START);
  const [isBitcoinSelected, setIsBitcoinSelected] = useState(true);
  const [isStacksSelected, setIsStacksSelected] = useState(false);
  const [bitcoinCredentials, setBitcoinCredentials] = useState<Credential | undefined>(undefined);
  const [ordinalsCredentials, setOrdinalsCredentials] = useState<Credential | undefined>(undefined);
  const [stacksCredentials, setStacksCredentials] = useState<Credential | undefined>(undefined);
  const [masterPubKey, setMasterPubKey] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [accountId, setAccountId] = useState(0);
  const [accountName, setAccountName] = useState('');
  const [accountNameError, setAccountNameError] = useState<string | undefined>();
  const [isBtcAddressConfirmed, setIsBtcAddressConfirmed] = useState(false);
  const [isOrdinalsAddressConfirmed, setIsOrdinalsAddressConfirmed] = useState(false);
  const [isStxAddressRejected, setIsStxAddressRejected] = useState(false);
  const [isBtcAddressRejected, setIsBtcAddressRejected] = useState(false);
  const [isOrdinalsAddressRejected, setIsOrdinalsAddressRejected] = useState(false);
  const { t } = useTranslation('translation', {
    keyPrefix: 'OPTIONS_DIALOG',
  });
  const { addLedgerAccount, updateLedgerAccounts } = useWalletReducer();
  const [selectedLedgerLiveOption, setSelectedLedgerLiveOption] =
    useState<LedgerLiveOptions | null>(null);
  const [isTogglerChecked, setIsTogglerChecked] = useState(false);
  const { ledgerAccountsList, network } = useWalletSelector();
  const transition = useTransition(currentStep, DEFAULT_TRANSITION_OPTIONS);
  const allAccounts = useGetAllAccounts();

  const importBtcAccounts = async (showAddress: boolean, masterFingerPrint?: string) => {
    let btcCreds;
    let ordinalsCreds;
    const transport = await Transport.create();
    const newAccountId = getNewAccountId(ledgerAccountsList);
    setAccountId(newAccountId);
    const deviceNewAccountIndex = getDeviceNewAccountIndex(
      ledgerAccountsList,
      network.type,
      masterPubKey || masterFingerPrint,
    );
    if (isBitcoinSelected) {
      try {
        const bitcoinAccount = await importNativeSegwitAccountFromLedger({
          transport,
          network: network.type,
          accountIndex: 0,
          addressIndex: deviceNewAccountIndex,
          showAddress,
        });
        btcCreds = {
          address: bitcoinAccount.address,
          publicKey: bitcoinAccount.publicKey,
        };
        setBitcoinCredentials(btcCreds);
        if (showAddress) {
          setIsBtcAddressConfirmed(true);
          setCurrentStep(ImportLedgerSteps.ADD_ORDINALS_ADDRESS);
        }
      } catch (err: any) {
        console.error(err);
        if (err.statusCode === 27013) {
          setIsBtcAddressRejected(true);
        } else {
          setIsConnectFailed(true);
        }
        setIsButtonDisabled(false);
        await transport.close();
        return;
      }
      try {
        const ordinalsAccount = await importTaprootAccountFromLedger({
          transport,
          network: network.type,
          accountIndex: 0,
          addressIndex: deviceNewAccountIndex,
          showAddress,
        });
        ordinalsCreds = {
          address: ordinalsAccount.address,
          publicKey: ordinalsAccount.publicKey,
        };
        setOrdinalsCredentials(ordinalsCreds);
        if (showAddress) {
          setIsOrdinalsAddressConfirmed(true);
        }
      } catch (err: any) {
        console.error(err);
        if (err.statusCode === 27013) {
          setIsOrdinalsAddressRejected(true);
        } else {
          setIsConnectFailed(true);
        }
        setIsButtonDisabled(false);
        await transport.close();
        return;
      }
    }
    await transport.close();

    return { btcCreds, ordinalsCreds, newAccountId };
  };

  const importStxAccounts = async (showAddress: boolean) => {
    const { deviceAccountIndex } = ledgerAccountsList[ledgerAccountsList.length - 1];

    setIsButtonDisabled(true);
    const transport = await Transport.create();

    try {
      const stacksCreds = await importStacksAccountFromLedger({
        transport,
        network: network.type,
        accountIndex: 0,
        addressIndex: deviceAccountIndex,
        showAddress,
      });
      setStacksCredentials(stacksCreds);
      await transport.close();

      return stacksCreds;
    } catch (err: any) {
      console.error(err);
      if (err.message === LedgerErrors.NO_PUBLIC_KEY) {
        setIsStxAddressRejected(true);
      }
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      await transport.close();
    }
  };

  const handleClickNext = async () => {
    /*
      Go back to Connect Ledger step if user wants to add the stacks account as well
    */
    if (currentStep === ImportLedgerSteps.ADDRESS_ADDED && isBitcoinSelected && isStacksSelected) {
      setIsBitcoinSelected(false);
      setIsButtonDisabled(false);
      setIsConnectSuccess(false);
      setIsConnectFailed(false);

      setCurrentStep(ImportLedgerSteps.CONNECT_LEDGER);
      return;
    }

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
    const currentAccount = ledgerAccountsList.find(
      (account) =>
        account.id === newAccountId && account.masterPubKey === (masterPubKey || masterFingerPrint),
    );

    try {
      if (!currentAccount) {
        const ledgerAccount: Account = {
          id: newAccountId,
          stxAddress: stacksCreds?.address || '',
          masterPubKey: masterPubKey || masterFingerPrint || '',
          stxPublicKey: stacksCreds?.publicKey || '',
          accountType: 'ledger',
          accountName: `Ledger Account ${newAccountId + 1}`,
          deviceAccountIndex: getDeviceNewAccountIndex(
            ledgerAccountsList,
            network.type,
            masterPubKey || masterFingerPrint,
          ),
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
        await addLedgerAccount(ledgerAccount);
        await delay(1000);
        setCurrentStep(ImportLedgerSteps.ADDRESS_ADDED);
        return;
      }

      if (currentAccount && isBitcoinSelected) {
        const ledgerAccount: Account = {
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
        await updateLedgerAccounts(ledgerAccount);
        await delay(1000);
        setCurrentStep(ImportLedgerSteps.ADDRESS_ADDED);
        return;
      }

      if (currentAccount && isStacksSelected) {
        const ledgerAccount: Account = {
          ...currentAccount,
          stxAddress: stacksCreds?.address || '',
          stxPublicKey: stacksCreds?.publicKey || '',
        };
        await updateLedgerAccounts(ledgerAccount);
        await delay(1000);
        setCurrentStep(ImportLedgerSteps.ADDRESS_ADDED);
      }

      await delay(500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleClickMultipleAccounts = async () => {
    try {
      setCurrentStep(ImportLedgerSteps.ADD_ADDRESS);
      setIsButtonDisabled(true);
      if (isBitcoinSelected) {
        const importedBtcAccounts = await importBtcAccounts(true);
        if (!importedBtcAccounts) {
          throw new Error('No accounts');
        }
        const { btcCreds, ordinalsCreds, newAccountId } = importedBtcAccounts;
        await saveAddressToWallet({ btcCreds, ordinalsCreds, newAccountId });
      }
    } catch (err) {
      console.error(err);
      setIsButtonDisabled(false);
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    }
  };

  const fetchMasterPubKey = async () => {
    const transport = await Transport.create();
    const masterFingerPrint = await getMasterFingerPrint(transport);
    setMasterPubKey(masterFingerPrint);
    return masterFingerPrint;
  };

  const checkDeviceConnection = async () => {
    try {
      setIsConnectFailed(false);
      setIsBtcAddressRejected(false);
      setIsOrdinalsAddressRejected(false);
      setIsButtonDisabled(true);
      const masterFingerPrint = isBitcoinSelected ? await fetchMasterPubKey() : masterPubKey;
      if (isBitcoinSelected) {
        await importBtcAccounts(false, masterFingerPrint);
      } else {
        await importStxAccounts(false);
      }
      setIsConnectSuccess(true);
      await delay(1500);
      if (
        isBitcoinSelected &&
        ledgerAccountsList?.find((account) => account.masterPubKey === masterFingerPrint)
      ) {
        setIsButtonDisabled(false);
        setCurrentStep(ImportLedgerSteps.ADD_MULTIPLE_ACCOUNTS);
        return;
      }
      handleClickNext();
      if (isBitcoinSelected) {
        const importedBtcAccounts = await importBtcAccounts(true, masterFingerPrint);
        if (!importedBtcAccounts) {
          throw new Error('No accounts');
        }
        const { btcCreds, ordinalsCreds, newAccountId } = importedBtcAccounts;
        await saveAddressToWallet({ btcCreds, ordinalsCreds, masterFingerPrint, newAccountId });
      } else {
        const stacksCreds = await importStxAccounts(true);
        if (!stacksCreds) {
          throw new Error('No response');
        }
        await saveAddressToWallet({
          masterFingerPrint,
          newAccountId: accountId,
          stacksCreds,
        });
      }
    } catch (err) {
      console.error(err);
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
      const accountToUpdate = ledgerAccountsList.find(
        (account) => account.id === accountId && account.masterPubKey === masterPubKey,
      );
      if (!accountToUpdate) {
        throw new Error('Account not found');
      }
      const updatedAccount: Account = { ...accountToUpdate, accountName };
      await updateLedgerAccounts(updatedAccount);
      await delay(1000);
      handleClickNext();
    } catch (err) {
      console.error(err);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const backToAssetSelection = () => {
    setBitcoinCredentials(undefined);
    setOrdinalsCredentials(undefined);
    setStacksCredentials(undefined);
    setIsButtonDisabled(false);
    setIsConnectSuccess(false);
    setIsConnectFailed(false);
    setAccountName('');

    if (isStxAddressRejected) {
      setIsStxAddressRejected(false);
      setCurrentStep(ImportLedgerSteps.CONNECT_LEDGER);
      return;
    }

    setAccountId(0);
    setIsStacksSelected(false);
    setCurrentStep(ImportLedgerSteps.START);
  };

  const handleAssetSelect = (selectedAsset: 'Bitcoin' | 'Stacks') => {
    if (selectedAsset === 'Stacks') {
      setIsStacksSelected(!isStacksSelected);
    }
  };

  return (
    <Container>
      {transition((style) => (
        <>
          <OnBoardingContentContainer
            className={
              [
                ImportLedgerSteps.START,
                ImportLedgerSteps.CONNECT_LEDGER,
                ImportLedgerSteps.ADDRESS_ADDED,
                ImportLedgerSteps.IMPORT_END,
              ].includes(currentStep)
                ? 'center'
                : ''
            }
            style={style}
          >
            <Steps
              isConnectSuccess={isConnectSuccess}
              isBitcoinSelected={isBitcoinSelected}
              isStacksSelected={isStacksSelected}
              isTogglerChecked={isTogglerChecked}
              isBtcAddressConfirmed={isBtcAddressConfirmed}
              isOrdinalsAddressConfirmed={isOrdinalsAddressConfirmed}
              currentStep={currentStep}
              accountName={accountName}
              accountId={accountId}
              selectedLedgerLiveOption={selectedLedgerLiveOption}
              handleAssetSelect={handleAssetSelect}
              setSelectedLedgerLiveOption={setSelectedLedgerLiveOption}
              setIsTogglerChecked={setIsTogglerChecked}
              setAccountName={setAccountName}
              creds={{
                bitcoinCredentials,
                ordinalsCredentials,
                stacksCredentials,
              }}
              errors={{
                isConnectFailed,
                isBtcAddressRejected,
                isOrdinalsAddressRejected,
                isStxAddressRejected,
                accountNameError,
              }}
            />
          </OnBoardingContentContainer>
          <OnBoardingActionsContainer>
            <StepControls
              isBitcoinSelected={isBitcoinSelected}
              isStacksSelected={isStacksSelected}
              isTogglerChecked={isTogglerChecked}
              isButtonDisabled={isButtonDisabled}
              currentStep={currentStep}
              selectedLedgerLiveOption={selectedLedgerLiveOption}
              checkDeviceConnection={checkDeviceConnection}
              handleClickNext={handleClickNext}
              handleClickMultipleAccounts={handleClickMultipleAccounts}
              backToAssetSelection={backToAssetSelection}
              updateAccountName={updateAccountName}
              errors={{
                isConnectFailed,
                isBtcAddressRejected,
                isOrdinalsAddressRejected,
                isStxAddressRejected,
                accountNameError,
              }}
            />
          </OnBoardingActionsContainer>
        </>
      ))}
    </Container>
  );
}

export default ImportLedger;
