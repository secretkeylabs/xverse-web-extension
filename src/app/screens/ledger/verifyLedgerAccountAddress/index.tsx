import { delay } from '@common/utils/promises';
import ActionButton from '@components/button';
import InfoContainer from '@components/infoContainer';
import LedgerAddressComponent from '@components/ledger/ledgerAddressComponent';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { useTransition } from '@react-spring/web';
import {
  importNativeSegwitAccountFromLedger,
  importStacksAccountFromLedger,
  importTaprootAccountFromLedger,
} from '@secretkeylabs/xverse-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { useLocation } from 'react-router-dom';

import stxIcon from '@assets/img/dashboard/stx_icon.svg';
import btcIcon from '@assets/img/ledger/btc_icon.svg';
import checkCircleIcon from '@assets/img/ledger/check_circle.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
import ordinalsIcon from '@assets/img/ledger/ordinals_icon.svg';
import LedgerFailView from '@components/ledger/failLedgerView';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import { DEFAULT_TRANSITION_OPTIONS } from '@utils/constants';
import LedgerConnectionView from '../../../components/ledger/connectLedgerView';

import useSelectedAccount from '@hooks/useSelectedAccount';
import {
  ActionButtonContainer,
  ActionButtonsContainer,
  AddAddressDetailsContainer,
  AddAddressHeaderContainer,
  AddressAddedContainer,
  Container,
  CopyContainer,
  InfoAlertContainer,
  LedgerFailButtonsContainer,
  LedgerFailViewContainer,
  OnBoardingActionsContainer,
  OnBoardingContentContainer,
  QRCodeContainer,
  SelectAssetText,
  SelectAssetTitle,
} from './index.styled';

enum Steps {
  ConnectLedger = 0,
  VerifyAddress = 1,
  AddressVerified = 2,
}

function VerifyLedger(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState(Steps.ConnectLedger);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isBtcAddressRejected, setIsBtcAddressRejected] = useState(false);
  const [isOrdinalsAddressRejected, setIsOrdinalsAddressRejected] = useState(false);
  const selectedAccount = useSelectedAccount();
  const [isWrongDevice, setIsWrongDevice] = useState(false);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const mismatch = params.get('mismatch') ?? '';
  const currency = params.get('currency') ?? '';
  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_VERIFY_SCREEN' });
  const { network } = useWalletSelector();
  const transition = useTransition(currentStepIndex, DEFAULT_TRANSITION_OPTIONS);

  const isBitcoinSelected = currency === 'BTC';
  const isOrdinalSelected = currency === 'ORD';
  const isStacksSelected = currency === 'STX';

  useResetUserFlow('/verify-ledger');

  const getAddress = () => {
    switch (currency) {
      case 'STX':
        return selectedAccount?.stxAddress || '';
      case 'BTC':
        return selectedAccount?.btcAddress || '';
      case 'ORD':
        return selectedAccount?.ordinalsAddress || '';
      default:
        return '';
    }
  };

  const handleClickNext = () => {
    setCurrentStepIndex((prevStepIndex) => prevStepIndex + 1);
  };

  const importBtcAccounts = async (showAddress: boolean) => {
    const transport = await Transport.create();
    const addressIndex = selectedAccount?.deviceAccountIndex;

    if (isBitcoinSelected) {
      try {
        await importNativeSegwitAccountFromLedger({
          transport,
          network: network.type,
          accountIndex: 0,
          addressIndex,
          showAddress,
        });
        setIsButtonDisabled(false);
        setCurrentStepIndex(Steps.AddressVerified);
      } catch (err: any) {
        if (err.statusCode === 27013) {
          setIsBtcAddressRejected(true);
        } else {
          setIsConnectFailed(true);
        }
        setIsButtonDisabled(false);
        await transport.close();
        return;
      }
    } else {
      try {
        await importTaprootAccountFromLedger({
          transport,
          network: network.type,
          accountIndex: 0,
          addressIndex,
          showAddress,
        });
        setIsButtonDisabled(false);
        setCurrentStepIndex(Steps.AddressVerified);
      } catch (err: any) {
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
  };

  const importStxAccounts = async (showAddress: boolean) => {
    setIsButtonDisabled(true);
    const transport = await Transport.create();
    const addressIndex = selectedAccount?.deviceAccountIndex;

    try {
      await importStacksAccountFromLedger({
        transport,
        network: network.type,
        accountIndex: 0,
        addressIndex,
        showAddress,
      });
      setIsButtonDisabled(false);
      setCurrentStepIndex(Steps.AddressVerified);
    } catch (err: any) {
      console.error(err);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      await transport.close();
    }
    await transport.close();
  };

  const checkDeviceConnection = async () => {
    try {
      setIsConnectFailed(false);
      setIsBtcAddressRejected(false);
      setIsOrdinalsAddressRejected(false);
      setIsButtonDisabled(true);

      const addressIndex = selectedAccount?.deviceAccountIndex;

      if (addressIndex === undefined) {
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
        setIsWrongDevice(true);
        setIsButtonDisabled(false);
        return;
      }

      setIsConnectSuccess(true);
      await delay(1500);
      handleClickNext();
      if (isBitcoinSelected || isOrdinalSelected) {
        await importBtcAccounts(true);
      } else if (isStacksSelected) {
        await importStxAccounts(true);
      }
    } catch (err) {
      console.error(err);
      setIsButtonDisabled(false);
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    }
  };

  const handleWindowClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  const backToAssetSelection = () => {
    setIsButtonDisabled(false);
    setIsConnectSuccess(false);
    setIsConnectFailed(false);
    setIsBtcAddressRejected(false);
    setIsOrdinalsAddressRejected(false);

    setCurrentStepIndex(Steps.ConnectLedger);
  };

  const getTitle = () => {
    if (isBitcoinSelected) return t('BTC_ADDRESS');
    if (isOrdinalSelected) return t('ORDINALS_ADDRESS');
    if (isStacksSelected) return t('STACKS_ADDRESS');

    return '';
  };

  const getIconSrc = () => {
    if (isBitcoinSelected) return btcIcon;
    if (isOrdinalSelected) return ordinalsIcon;
    if (isStacksSelected) return stxIcon;
  };

  const connectionFailedErrorText = isStacksSelected
    ? 'STX_SUBTITLE_FAILED'
    : 'BTC_SUBTITLE_FAILED';

  const renderContent = () => {
    switch (currentStepIndex) {
      case Steps.ConnectLedger:
        return (
          <LedgerConnectionView
            title={t(isStacksSelected ? 'LEDGER_CONNECT.STX_TITLE' : 'LEDGER_CONNECT.BTC_TITLE')}
            text={t(
              isStacksSelected ? 'LEDGER_CONNECT.STX_SUBTITLE' : 'LEDGER_CONNECT.BTC_SUBTITLE',
            )}
            titleFailed={t('TITLE_FAILED')}
            textFailed={t(
              isWrongDevice ? 'WRONG_DEVICE_ERROR_SUBTITLE' : connectionFailedErrorText,
            )}
            imageDefault={isStacksSelected ? ledgerConnectStxIcon : ledgerConnectBtcIcon}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        );
      case Steps.VerifyAddress:
        return isConnectFailed || isBtcAddressRejected || isOrdinalsAddressRejected ? (
          <LedgerFailView
            title={t(
              isBtcAddressRejected || isOrdinalsAddressRejected
                ? 'TITLE_CANCELLED'
                : 'TITLE_FAILED',
            )}
            text={t(
              isBtcAddressRejected || isOrdinalsAddressRejected
                ? 'SUBTITLE_CANCELLED'
                : connectionFailedErrorText,
            )}
          />
        ) : (
          <>
            <AddAddressHeaderContainer>
              <img src={getIconSrc()} width={32} height={32} alt={getTitle()} />
              <SelectAssetTitle>
                {isBitcoinSelected && t('TITLE_VERIFY_BTC')}
                {isOrdinalSelected && t('TITLE_VERIFY_ORDINALS')}
                {isStacksSelected && t('TITLE_VERIFY_STX')}
              </SelectAssetTitle>
            </AddAddressHeaderContainer>
            <AddAddressDetailsContainer>
              <SelectAssetText>{t('SUBTITLE_VERIFY')}</SelectAssetText>
              <Container>
                <QRCodeContainer>
                  <QRCode value={getAddress()} size={130} />
                </QRCodeContainer>

                <CopyContainer>
                  {isOrdinalSelected && (
                    <InfoAlertContainer>
                      <InfoContainer bodyText={t('ORDINALS_RECEIVE_MESSAGE')} />
                    </InfoAlertContainer>
                  )}
                  {isBitcoinSelected && (
                    <InfoAlertContainer>
                      <InfoContainer bodyText={t('BTC_RECEIVE_MESSAGE')} />
                    </InfoAlertContainer>
                  )}
                  {isStacksSelected && (
                    <InfoAlertContainer>
                      <InfoContainer bodyText={t('STX_RECEIVE_MESSAGE')} />
                    </InfoAlertContainer>
                  )}
                </CopyContainer>
                <LedgerAddressComponent title={getTitle()} address={getAddress()} />
              </Container>
            </AddAddressDetailsContainer>
          </>
        );
      case Steps.AddressVerified:
        return (
          <AddressAddedContainer>
            <img src={checkCircleIcon} alt="Success" />
            <SelectAssetTitle>
              {isBitcoinSelected && t('BTC_TITLE_VERIFIED')}
              {isOrdinalSelected && t('ORDINALS_TITLE_VERIFIED')}
              {isStacksSelected && t('STACKS_TITLE_VERIFIED')}
            </SelectAssetTitle>
          </AddressAddedContainer>
        );
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    switch (currentStepIndex) {
      case Steps.ConnectLedger:
        return (
          <ActionButton
            processing={isButtonDisabled}
            disabled={isButtonDisabled}
            onPress={checkDeviceConnection}
            text={t(isConnectFailed ? 'TRY_AGAIN_BUTTON' : 'CONNECT_BUTTON')}
          />
        );
      case Steps.VerifyAddress:
        if (isConnectFailed || isBtcAddressRejected || isOrdinalsAddressRejected) {
          return (
            <ActionButtonsContainer>
              <ActionButtonContainer>
                <ActionButton
                  processing={isButtonDisabled}
                  disabled={isButtonDisabled}
                  onPress={backToAssetSelection}
                  text={t('TRY_AGAIN_BUTTON')}
                />
              </ActionButtonContainer>
              <ActionButtonContainer>
                <ActionButton
                  transparent
                  disabled={isButtonDisabled}
                  processing={isButtonDisabled}
                  onPress={handleWindowClose}
                  text={t('CLOSE_BUTTON')}
                />
              </ActionButtonContainer>
            </ActionButtonsContainer>
          );
        }
        break;
      case Steps.AddressVerified:
        return (
          <ActionButtonsContainer>
            <ActionButtonContainer>
              <ActionButton
                processing={isButtonDisabled}
                disabled={isButtonDisabled}
                onPress={backToAssetSelection}
                text={t('VERIFY_AGAIN_BUTTON')}
              />
            </ActionButtonContainer>
            <ActionButtonContainer>
              <ActionButton
                transparent
                disabled={isButtonDisabled}
                processing={isButtonDisabled}
                onPress={handleWindowClose}
                text={t('CLOSE_BUTTON')}
              />
            </ActionButtonContainer>
          </ActionButtonsContainer>
        );
      default:
        return null;
    }
  };

  if (mismatch) {
    return (
      <Container>
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
      {transition((style) => (
        <>
          <OnBoardingContentContainer
            className={
              [Steps.ConnectLedger, Steps.AddressVerified].includes(currentStepIndex)
                ? 'center'
                : ''
            }
            style={style}
          >
            {renderContent()}
          </OnBoardingContentContainer>
          <OnBoardingActionsContainer>{renderActionButton()}</OnBoardingActionsContainer>
        </>
      ))}
    </Container>
  );
}

export default VerifyLedger;
