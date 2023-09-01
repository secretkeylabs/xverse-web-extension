import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { animated, useTransition } from '@react-spring/web';
import Transport from '@ledgerhq/hw-transport-webusb';
import ActionButton from '@components/button';
import {
  importNativeSegwitAccountFromLedger,
  importStacksAccountFromLedger,
  importTaprootAccountFromLedger,
} from '@secretkeylabs/xverse-core';
import { ledgerDelay } from '@common/utils/ledger';
import LedgerAddressComponent from '@components/ledger/ledgerAddressComponent';
import useWalletSelector from '@hooks/useWalletSelector';
import FullScreenHeader from '@components/ledger/fullScreenHeader';
import { useLocation } from 'react-router-dom';
import QRCode from 'react-qr-code';
import InfoContainer from '@components/infoContainer';

import btcIcon from '@assets/img/ledger/btc_icon.svg';
import ordinalsIcon from '@assets/img/ledger/ordinals_icon.svg';
import stxIcon from '@assets/img/ledger/stx_icon.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
import checkCircleIcon from '@assets/img/ledger/check_circle.svg';
import LedgerFailView from '@components/ledger/failLedgerView';
import useResetUserFlow from '@hooks/useResetUserFlow';
import LedgerConnectionView from '../../../components/ledger/connectLedgerView';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const OnBoardingContentContainer = styled(animated.div)((props) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  flex: 1,
  justifyContent: props.className === 'center' ? 'center' : 'none',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const OnBoardingActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
}));

const SelectAssetTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

const SelectAssetText = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  textAlign: 'center',
}));

const AddAddressHeaderContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: props.theme.spacing(8),
  marginTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(8),
}));

const AddAddressDetailsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: props.theme.spacing(20),
}));

const AddressAddedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  > :first-child {
    margin-bottom: 26px;
  }
`;

const CopyContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 328,
  justifyContent: 'center',
  marginTop: props.theme.spacing(11),
}));

const QRCodeContainer = styled.div((props) => ({
  display: 'flex',
  aspectRatio: 1,
  backgroundColor: props.theme.colors.white_0,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  padding: props.theme.spacing(5),
  marginBottom: props.theme.spacing(12),
}));

const InfoAlertContainer = styled.div({
  width: '100%',
});

const ActionButtonsContainer = styled.div({
  width: '100%',
});

const ActionButtonContainer = styled.div((props) => ({
  '&:not(:last-of-type)': {
    marginBottom: props.theme.spacing(8),
  },
}));

const LedgerFailViewContainer = styled.div((props) => ({
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  margin: 'auto',
}));

const LedgerFailButtonsContainer = styled.div((props) => ({
  width: '100%',
  marginTop: props.theme.spacing(25),
}));

function VerifyLedger(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isBtcAddressRejected, setIsBtcAddressRejected] = useState(false);
  const [isOrdinalsAddressRejected, setIsOrdinalsAddressRejected] = useState(false);
  const { selectedAccount } = useWalletSelector();
  const [isWrongDevice, setIsWrongDevice] = useState(false);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const mismatch = params.get('mismatch') ?? '';
  const currency = params.get('currency') ?? '';
  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_VERIFY_SCREEN' });
  const { network } = useWalletSelector();
  const transition = useTransition(currentStepIndex, {
    from: {
      x: 24,
      opacity: 0,
    },
    enter: {
      x: 0,
      opacity: 1,
    },
  });

  const isBitcoinSelected = currency === 'BTC';
  const isOrdinalSelected = currency === 'ORD' || currency === 'brc-20';
  const isStacksSelected = currency === 'STX';

  useResetUserFlow('/verify-ledger');

  const getAddress = () => {
    switch (currency) {
      case 'STX':
        return selectedAccount?.stxAddress || '';
      case 'BTC':
        return selectedAccount?.btcAddress || '';
      case 'FT':
        return selectedAccount?.stxAddress || '';
      case 'ORD':
      case 'brc-20':
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
        await importNativeSegwitAccountFromLedger(
          transport,
          network.type,
          0,
          addressIndex,
          showAddress,
        );
        setIsButtonDisabled(false);
        setCurrentStepIndex(2);
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
        await importTaprootAccountFromLedger(transport, network.type, 0, addressIndex, showAddress);
        setIsButtonDisabled(false);
        setCurrentStepIndex(2);
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
      await importStacksAccountFromLedger(transport, network.type, 0, addressIndex, showAddress);
      setIsButtonDisabled(false);
      setCurrentStepIndex(2);
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
      await ledgerDelay(1500);
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

    setCurrentStepIndex(0);
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
          <OnBoardingContentContainer
            className={[0, 2, 4, 6].includes(currentStepIndex) ? 'center' : ''}
            style={style}
          >
            {currentStepIndex === 0 && (
              <LedgerConnectionView
                title={t(
                  isStacksSelected ? 'LEDGER_CONNECT.STX_TITLE' : 'LEDGER_CONNECT.BTC_TITLE',
                )}
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
            )}
            {currentStepIndex === 1 &&
              (isConnectFailed || isBtcAddressRejected || isOrdinalsAddressRejected ? (
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
              ))}
            {currentStepIndex === 2 && (
              <AddressAddedContainer>
                <img src={checkCircleIcon} alt="Success" />
                <SelectAssetTitle>
                  {isBitcoinSelected && t('BTC_TITLE_VERIFIED')}
                  {isOrdinalSelected && t('ORDINALS_TITLE_VERIFIED')}
                  {isStacksSelected && t('STACKS_TITLE_VERIFIED')}
                </SelectAssetTitle>
              </AddressAddedContainer>
            )}
          </OnBoardingContentContainer>
          <OnBoardingActionsContainer>
            {currentStepIndex === 0 && (
              <ActionButton
                processing={isButtonDisabled}
                disabled={isButtonDisabled}
                onPress={checkDeviceConnection}
                text={t(isConnectFailed ? 'TRY_AGAIN_BUTTON' : 'CONNECT_BUTTON')}
              />
            )}
            {currentStepIndex === 1 &&
              (isConnectFailed || isBtcAddressRejected || isOrdinalsAddressRejected) && (
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
              )}
            {currentStepIndex === 2 && (
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
            )}
          </OnBoardingActionsContainer>
        </>
      ))}
    </Container>
  );
}

export default VerifyLedger;
