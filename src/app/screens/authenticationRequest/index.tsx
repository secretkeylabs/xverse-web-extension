import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
import DappPlaceholderIcon from '@assets/img/webInteractions/authPlaceholder.svg';
import { MESSAGE_SOURCE } from '@common/types/message-types';
import { ledgerDelay } from '@common/utils/ledger';
import AccountHeaderComponent from '@components/accountHeader';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import ConfirmScreen from '@components/confirmScreen';
import InfoContainer from '@components/infoContainer';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { createAuthResponse, handleLedgerStxJWTAuth } from '@secretkeylabs/xverse-core';
import { AddressVersion, publicKeyToAddress, StacksMessageType } from '@stacks/transactions';
import { isHardwareAccount } from '@utils/helper';
import { decodeToken } from 'jsontokens';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import validUrl from 'valid-url';

const MainContainer = styled.div({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(20),
}));

const TopImage = styled.img({
  aspectRatio: 1,
  height: 88,
  borderWidth: 10,
  borderColor: 'white',
});

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.spacing(8),
}));

const DappTitle = styled.h2((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(2),
}));

const InfoContainerWrapper = styled.div((props) => ({
  margin: props.theme.spacing(10),
  marginBottom: 0,
}));

function AuthenticationRequest() {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const { t } = useTranslation('translation', { keyPrefix: 'AUTH_REQUEST_SCREEN' });

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const authRequestToken = params.get('authRequest') ?? '';
  const authRequest = decodeToken(authRequestToken);
  const { seedPhrase, selectedAccount } = useWalletSelector();
  const isDisabled = !selectedAccount?.stxAddress;

  const confirmCallback = async () => {
    setLoading(true);
    try {
      if (isHardwareAccount(selectedAccount) && !isDisabled) {
        setIsModalVisible(true);
        return;
      }

      const authResponse = await createAuthResponse(
        seedPhrase,
        selectedAccount?.id ?? 0,
        authRequest,
      );
      chrome.tabs.sendMessage(+(params.get('tabId') ?? '0'), {
        source: MESSAGE_SOURCE,
        payload: {
          authenticationRequest: authRequestToken,
          authenticationResponse: authResponse,
        },
        method: 'authenticationResponse',
      });
      window.close();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cancelCallback = () => {
    chrome.tabs.sendMessage(+(params.get('tabId') ?? '0'), {
      source: MESSAGE_SOURCE,
      payload: {
        authenticationRequest: authRequestToken,
        authenticationResponse: 'cancel',
      },
      method: 'authenticationResponse',
    });
    window.close();
  };

  const getDappLogo = () =>
    validUrl.isWebUri(authRequest?.payload?.appDetails?.icon)
      ? authRequest?.payload?.appDetails?.icon
      : DappPlaceholderIcon;

  const handleConnectAndConfirm = async () => {
    if (!selectedAccount) {
      console.error('No account selected');
      return;
    }

    if (selectedAccount.deviceAccountIndex === undefined) {
      console.error('No account found');
      return;
    }
    setIsButtonDisabled(true);

    const transport = await Transport.create();

    if (!transport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      return;
    }

    setIsConnectSuccess(true);
    await ledgerDelay(1500);
    setCurrentStepIndex(1);

    const profile = {
      stxAddress: {
        mainnet: selectedAccount.stxAddress,
        testnet: publicKeyToAddress(AddressVersion.MainnetSingleSig, {
          data: Buffer.from(selectedAccount.stxPublicKey, 'hex'),
          type: StacksMessageType.PublicKey,
        }),
      },
    };

    try {
      const authResponse = await handleLedgerStxJWTAuth({
        transport,
        addressIndex: selectedAccount.deviceAccountIndex,
        profile,
      });
      setIsTxApproved(true);
      await ledgerDelay(1500);
      chrome.tabs.sendMessage(+(params.get('tabId') ?? '0'), {
        source: MESSAGE_SOURCE,
        payload: {
          authenticationRequest: authRequestToken,
          authenticationResponse: authResponse,
        },
        method: 'authenticationResponse',
      });
      window.close();
    } catch (e) {
      console.error(e);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      await transport.close();
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  return (
    <ConfirmScreen
      onConfirm={confirmCallback}
      onCancel={cancelCallback}
      confirmText={t('CONNECT_BUTTON')}
      cancelText={t('CANCEL_BUTTON')}
      loading={loading}
      disabled={isDisabled}
    >
      <AccountHeaderComponent />
      <MainContainer>
        <TopImage src={getDappLogo()} alt="Dapp Logo" />
        <FunctionTitle>{t('TITLE')}</FunctionTitle>
        <DappTitle>{`${t('REQUEST_TOOLTIP')} ${authRequest.payload.appDetails?.name}`}</DappTitle>
        {isDisabled && (
          <InfoContainerWrapper>
            <InfoContainer
              bodyText={t('NO_STACKS_AUTH_SUPPORT.TITLE')}
              redirectText={t('NO_STACKS_AUTH_SUPPORT.LINK')}
              onClick={async () => {
                await chrome.tabs.create({
                  url: chrome.runtime.getURL(`options.html#/add-stx-address-ledger`),
                });

                window.close();
              }}
            />
          </InfoContainerWrapper>
        )}
      </MainContainer>
      <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        {currentStepIndex === 0 && (
          <LedgerConnectionView
            title={t('LEDGER.CONNECT.TITLE')}
            text={t('LEDGER.CONNECT.SUBTITLE')}
            titleFailed={t('LEDGER.CONNECT.ERROR_TITLE')}
            textFailed={t('LEDGER.CONNECT.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectStxIcon}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        )}
        {currentStepIndex === 1 && (
          <LedgerConnectionView
            title={t('LEDGER.CONFIRM.TITLE')}
            text={t('LEDGER.CONFIRM.SUBTITLE')}
            titleFailed={t('LEDGER.CONFIRM.ERROR_TITLE')}
            textFailed={t('LEDGER.CONFIRM.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectDefaultIcon}
            isConnectSuccess={isTxApproved}
            isConnectFailed={isTxRejected}
          />
        )}
        <SuccessActionsContainer>
          <ActionButton
            onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
            text={t(isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'CONNECT_BUTTON')}
            disabled={isButtonDisabled}
            processing={isButtonDisabled}
          />
          <ActionButton onPress={cancelCallback} text={t('CANCEL_BUTTON')} transparent />
        </SuccessActionsContainer>
      </BottomModal>
    </ConfirmScreen>
  );
}

export default AuthenticationRequest;
