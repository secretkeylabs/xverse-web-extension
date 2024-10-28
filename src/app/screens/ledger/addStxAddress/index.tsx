import stxIcon from '@assets/img/dashboard/stx_icon.svg';
import checkCircleIcon from '@assets/img/ledger/check_circle.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
import { delay } from '@common/utils/promises';
import ActionButton from '@components/button';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import LedgerFailView from '@components/ledger/failLedgerView';
import FullScreenHeader from '@components/ledger/fullScreenHeader';
import LedgerAddressComponent from '@components/ledger/ledgerAddressComponent';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { useTransition } from '@react-spring/web';
import {
  LedgerErrors,
  importStacksAccountFromLedger,
  type Account,
} from '@secretkeylabs/xverse-core';
import { DEFAULT_TRANSITION_OPTIONS } from '@utils/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import type { Credential } from '../importLedgerAccount';

import useSelectedAccount from '@hooks/useSelectedAccount';
import {
  Container,
  OnBoardingActionsContainer,
  OnBoardingContentContainer,
} from '../importLedgerAccount/index.styled';
import {
  ActionButtonContainer,
  AddAddressDetailsContainer,
  AddAddressHeaderContainer,
  AddressAddedContainer,
  ConfirmationText,
  LedgerFailButtonsContainer,
  LedgerFailViewContainer,
  SelectAssetText,
  SelectAssetTitle,
} from '../importLedgerAccount/steps/index.styled';

enum Steps {
  ConnectLedger = 0,
  VerifyAddress = 1,
  AddressAdded = 2,
}

function AddStxAddress(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_IMPORT_SCREEN' });
  const [currentStep, setCurrentStep] = useState(Steps.ConnectLedger);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isAddressRejected, setIsAddressRejected] = useState(false);
  const [stacksCredentials, setStacksCredentials] = useState<Credential | undefined>(undefined);
  const selectedAccount = useSelectedAccount();
  const { network, ledgerAccountsList } = useWalletSelector();
  const { updateLedgerAccounts } = useWalletReducer();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const mismatch = params.get('mismatch') ?? '';
  const transition = useTransition(currentStep, DEFAULT_TRANSITION_OPTIONS);

  useResetUserFlow('/add-stx-address-ledger');

  const handleClickNext = async () => {
    setCurrentStep((prevStepIndex) => prevStepIndex + 1);
  };

  const saveAddressToWallet = async (stacksCreds: { address: string; publicKey: string }) => {
    if (!selectedAccount) {
      return;
    }

    const existingAccount = ledgerAccountsList.find((account) => account.id === selectedAccount.id);

    if (!existingAccount) {
      return;
    }

    const ledgerAccount: Account = {
      ...existingAccount,
      stxAddress: stacksCreds?.address || '',
      stxPublicKey: stacksCreds?.publicKey || '',
    };
    await updateLedgerAccounts(ledgerAccount);
    await delay(1000);
    setCurrentStep(Steps.AddressAdded);
    setIsButtonDisabled(false);
  };

  const importStxAccounts = async (showAddress: boolean) => {
    setIsButtonDisabled(true);
    const transport = await Transport.create();

    try {
      const addressIndex = selectedAccount?.deviceAccountIndex;

      if (addressIndex === undefined) {
        throw new Error('Account not found');
      }

      const stacksCreds = await importStacksAccountFromLedger({
        transport,
        network: network.type,
        accountIndex: 0,
        addressIndex,
        showAddress,
      });
      setStacksCredentials(stacksCreds);
      await transport.close();

      return stacksCreds;
    } catch (err: any) {
      console.error(err);
      if (err.message === LedgerErrors.NO_PUBLIC_KEY) {
        setIsAddressRejected(true);
      }
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      await transport.close();
    }
  };

  const checkDeviceConnection = async () => {
    try {
      setIsConnectFailed(false);
      setIsButtonDisabled(true);

      const response = await importStxAccounts(false);
      if (!response) {
        throw new Error('No response');
      }

      setIsConnectSuccess(true);
      await delay(1500);
      handleClickNext();

      const stacksCreds = await importStxAccounts(true);

      if (!stacksCreds) {
        throw new Error('No response');
      }
      await saveAddressToWallet(stacksCreds);
    } catch (err: any) {
      console.error(err);
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
    }
  };

  const handleTryAgain = async () => {
    setIsButtonDisabled(false);
    setIsConnectSuccess(false);
    setIsConnectFailed(false);
    setIsAddressRejected(false);

    setCurrentStep(Steps.ConnectLedger);
  };

  const handleWindowClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case Steps.ConnectLedger:
        return (
          <LedgerConnectionView
            title={t('LEDGER_CONNECT.STX_TITLE')}
            text={t('LEDGER_CONNECT.STX_SUBTITLE')}
            titleFailed={t('LEDGER_CONNECT.TITLE_FAILED')}
            textFailed={t('LEDGER_CONNECT.STX_SUBTITLE_FAILED')}
            imageDefault={ledgerConnectStxIcon}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        );
      case Steps.VerifyAddress:
        if (isConnectFailed || isAddressRejected) {
          return (
            <LedgerFailView
              title={t(
                isAddressRejected
                  ? 'LEDGER_ADD_ADDRESS.TITLE_CANCELLED'
                  : 'LEDGER_CONNECT.TITLE_FAILED',
              )}
              text={t(
                isAddressRejected
                  ? 'LEDGER_ADD_ADDRESS.SUBTITLE_CANCELLED'
                  : 'LEDGER_CONNECT.BTC_SUBTITLE_FAILED',
              )}
            />
          );
        }

        return (
          <>
            <AddAddressHeaderContainer>
              <img src={stxIcon} width={32} height={32} alt="stacks" />
              <SelectAssetTitle>{t('LEDGER_ADD_ADDRESS.TITLE_VERIFY_STX')}</SelectAssetTitle>
            </AddAddressHeaderContainer>
            <AddAddressDetailsContainer>
              <SelectAssetText centered>{t('LEDGER_ADD_ADDRESS.SUBTITLE')}</SelectAssetText>
              <LedgerAddressComponent
                title={t('LEDGER_ADD_ADDRESS.STX')}
                address={stacksCredentials?.address}
              />
            </AddAddressDetailsContainer>
            <ConfirmationText>{t('LEDGER_ADD_ADDRESS.CONFIRM_TO_CONTINUE')}</ConfirmationText>
          </>
        );
      case Steps.AddressAdded:
        return (
          <AddressAddedContainer>
            <img src={checkCircleIcon} alt="Success" />
            <SelectAssetTitle>{t('LEDGER_STX_WALLET_ADDED.TITLE')}</SelectAssetTitle>
            <SelectAssetText centered>{t('LEDGER_STX_WALLET_ADDED.SUBTITLE')}</SelectAssetText>
          </AddressAddedContainer>
        );
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    switch (currentStep) {
      case Steps.ConnectLedger:
        return (
          <ActionButton
            processing={isButtonDisabled}
            disabled={isButtonDisabled}
            onPress={checkDeviceConnection}
            text={t(
              isConnectFailed ? 'LEDGER_IMPORT_TRY_AGAIN_BUTTON' : 'LEDGER_IMPORT_CONNECT_BUTTON',
            )}
          />
        );
      case Steps.VerifyAddress:
        if (isConnectFailed) {
          return (
            <ActionButton
              processing={isButtonDisabled}
              disabled={isButtonDisabled}
              onPress={handleTryAgain}
              text={t('LEDGER_IMPORT_TRY_AGAIN_BUTTON')}
            />
          );
        }
        break;
      case Steps.AddressAdded:
        return (
          <ActionButton
            disabled={isButtonDisabled}
            processing={isButtonDisabled}
            onPress={handleWindowClose}
            text={t('LEDGER_IMPORT_CLOSE_BUTTON')}
          />
        );
      default:
        return null;
    }
  };

  if (mismatch) {
    return (
      <Container>
        <FullScreenHeader />
        <LedgerFailViewContainer>
          <LedgerFailView title={t('TITLE_FAILED')} text={t('ADDRESS_MISMATCH')} />
          <LedgerFailButtonsContainer>
            <ActionButtonContainer>
              <ActionButton onPress={handleWindowClose} text={t('CLOSE_BUTTON')} />
            </ActionButtonContainer>
          </LedgerFailButtonsContainer>
        </LedgerFailViewContainer>
      </Container>
    );
  }

  return (
    <Container>
      <FullScreenHeader />
      {transition((style) => (
        <>
          <OnBoardingContentContainer style={style}>{renderContent()}</OnBoardingContentContainer>
          <OnBoardingActionsContainer>{renderActionButton()}</OnBoardingActionsContainer>
        </>
      ))}
    </Container>
  );
}

export default AddStxAddress;
