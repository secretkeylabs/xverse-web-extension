import styled from 'styled-components';
import ConfirmScreen from '@components/confirmScreen';
import useSignatureRequest, {
  isStructuredMessage,
  isUtf8Message,
  useSignBip322Message,
  useSignMessage,
} from '@hooks/useSignatureRequest';
import AccountHeaderComponent from '@components/accountHeader';
import { useTranslation } from 'react-i18next';
import { SignaturePayload, StructuredDataSignaturePayload } from '@stacks/connect';
import { useCallback, useEffect, useState } from 'react';
import { bytesToHex } from '@stacks/transactions';
import useWalletSelector from '@hooks/useWalletSelector';
import useWalletReducer from '@hooks/useWalletReducer';
import { getNetworkType, isHardwareAccount, getTruncatedAddress } from '@utils/helper';
import { hashMessage, signStxMessage } from '@secretkeylabs/xverse-core';
import BottomModal from '@components/bottomModal';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
import ActionButton from '@components/button';
import { ledgerDelay } from '@common/utils/ledger';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '@components/infoContainer';
import { bip0322Hash } from '@secretkeylabs/xverse-core/connect/bip322Signature';
import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import Transport from '@ledgerhq/hw-transport-webusb';
import { handleBip322LedgerMessageSigning, signatureVrsToRsv } from '@utils/ledger';
import { finalizeMessageSignature } from './utils';
import SignatureRequestStructuredData from './signatureRequestStructuredData';
import SignatureRequestMessage from './signatureRequestMessage';
import CollapsableContainer from './collapsableContainer';

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  flex: 1,
  height: '100%',
}));

const RequestType = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(11),
  color: props.theme.colors.white[0],
  textAlign: 'left',
  marginBottom: props.theme.spacing(4),
}));

const RequestSource = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[400],
  textAlign: 'left',
  marginBottom: props.theme.spacing(12),
}));

const MessageHash = styled.p((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  lineHeight: 1.6,
  wordWrap: 'break-word',
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(4),
}));

const SigningAddressContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  marginBottom: props.theme.spacing(6),
  flex: 1,
}));

const SigningAddressTitle = styled.p((props) => ({
  ...props.theme.body_medium_m,
  wordWrap: 'break-word',
  color: props.theme.colors.white[200],
  marginBottom: props.theme.spacing(4),
}));

const SigningAddress = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const SigningAddressType = styled.p((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(4),
}));

const SigningAddressValue = styled.p((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(4),
}));

const ActionDisclaimer = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[400],
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(8),
}));

const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(20),
}));

function SignatureRequest(): JSX.Element {
  const { t } = useTranslation('translation');
  const [isSigning, setIsSigning] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const { selectedAccount, accountsList, ledgerAccountsList, network } = useWalletSelector();
  const [addressType, setAddressType] = useState('');
  const { switchAccount } = useWalletReducer();
  const { messageType, request, payload, tabId, domain, isSignMessageBip322 } =
    useSignatureRequest();
  const navigate = useNavigate();
  const isMessageSigningDisabled =
    isHardwareAccount(selectedAccount) && !isSignMessageBip322 && !selectedAccount?.stxAddress;

  const checkAddressAvailability = () => {
    const account = accountsList.filter((acc) => {
      if (acc.btcAddress === payload.address) {
        setAddressType(t('SIGNATURE_REQUEST.SIGNING_ADDRESS_SEGWIT'));
        return true;
      }
      if (acc.ordinalsAddress === payload.address) {
        setAddressType(t('SIGNATURE_REQUEST.SIGNING_ADDRESS_TAPROOT'));
        return true;
      }
      if (acc.stxAddress === payload.stxAddress) {
        setAddressType(t('SIGNATURE_REQUEST.SIGNING_ADDRESS_STX'));
        return true;
      }
      return false;
    });
    return isHardwareAccount(selectedAccount) ? account[0] || selectedAccount : account[0];
  };

  const switchAccountBasedOnRequest = () => {
    if (!isSignMessageBip322 && getNetworkType(payload.network) !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          errorTitle: t('SIGNATURE_REQUEST.SIGNATURE_ERROR_TITLE'),
          error: t('CONFIRM_TRANSACTION.NETWORK_MISMATCH'),
          browserTx: true,
        },
      });
      return;
    }
    const account = checkAddressAvailability();
    if (account) {
      switchAccount(account);
    } else {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          errorTitle: t('SIGNATURE_REQUEST.SIGNATURE_ERROR_TITLE'),
          error: t('CONFIRM_TRANSACTION.ADDRESS_MISMATCH'),
          browserTx: true,
        },
      });
    }
  };

  useEffect(() => {
    switchAccountBasedOnRequest();
  }, []);

  const handleMessageSigning = useSignMessage(messageType);

  const handleBip322MessageSigning = useSignBip322Message(payload.message, payload.address);

  const cancelCallback = () => {
    finalizeMessageSignature({ requestPayload: request, tabId: +tabId, data: 'cancel' });
    window.close();
  };

  const confirmCallback = async () => {
    try {
      setIsSigning(true);
      if (isHardwareAccount(selectedAccount) && !isMessageSigningDisabled) {
        setIsModalVisible(true);
        return;
      }
      if (!isSignMessageBip322) {
        const signature = await handleMessageSigning({
          message: payload.message,
          domain: domain || undefined,
        });
        if (signature) {
          finalizeMessageSignature({ requestPayload: request, tabId: +tabId, data: signature });
        }
      } else {
        const bip322signature = await handleBip322MessageSigning();
        const signingMessage = {
          source: MESSAGE_SOURCE,
          method: ExternalSatsMethods.signMessageResponse,
          payload: {
            signMessageRequest: request,
            signMessageResponse: bip322signature,
          },
        };
        chrome.tabs.sendMessage(+tabId, signingMessage);
        window.close();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsSigning(false);
    }
  };

  const handleConnectAndConfirm = async () => {
    if (!selectedAccount) {
      console.error('No account selected');
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

    try {
      if (isSignMessageBip322) {
        const signature = await handleBip322LedgerMessageSigning({
          transport,
          id: selectedAccount.id,
          networkType: network.type,
          ledgerAccountsList,
          message: payload.message,
        });
        const signingMessage = {
          source: MESSAGE_SOURCE,
          method: ExternalSatsMethods.signMessageResponse,
          payload: {
            signMessageRequest: request,
            signMessageResponse: signature,
          },
        };
        chrome.tabs.sendMessage(+tabId, signingMessage);
        window.close();
      } else {
        const signature = await signStxMessage(
          transport,
          payload.message,
          0,
          selectedAccount.deviceAccountIndex,
        );
        const rsvSignature = signatureVrsToRsv(signature.signatureVRS.toString('hex'));
        const data = {
          signature: rsvSignature,
          publicKey: selectedAccount.stxPublicKey,
        };
        if (signature) {
          finalizeMessageSignature({ requestPayload: request, tabId: +tabId, data });
        }
      }
    } catch (e: any) {
      console.error(e);

      if (e.name === 'LockedDeviceError') {
        setCurrentStepIndex(0);
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
      } else if (e.statusCode === 28160) {
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
      } else {
        setIsTxRejected(true);
      }
    } finally {
      await transport.close();
      setIsButtonDisabled(false);
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectFailed(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  const getMessageHash = useCallback(() => {
    if (!isSignMessageBip322) {
      return bytesToHex(hashMessage(payload.message));
    }
    return bip0322Hash(payload.message);
  }, [isSignMessageBip322, payload.message]);

  return (
    <ConfirmScreen
      onConfirm={confirmCallback}
      onCancel={cancelCallback}
      cancelText={t('SIGNATURE_REQUEST.CANCEL_BUTTON')}
      confirmText={t('SIGNATURE_REQUEST.SIGN_BUTTON')}
      loading={isSigning}
      disabled={isMessageSigningDisabled}
    >
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />

      {isMessageSigningDisabled ? (
        <MainContainer>
          <InfoContainer
            bodyText={t('SIGNATURE_REQUEST.NO_STACKS_AUTH_SUPPORT.TITLE')}
            redirectText={t('SIGNATURE_REQUEST.NO_STACKS_AUTH_SUPPORT.LINK')}
            onClick={async () => {
              await chrome.tabs.create({
                url: chrome.runtime.getURL(`options.html#/add-stx-address-ledger`),
              });

              window.close();
            }}
          />
        </MainContainer>
      ) : (
        <MainContainer>
          <RequestType>{t('SIGNATURE_REQUEST.TITLE')}</RequestType>
          {!isSignMessageBip322 ? (
            <RequestSource>
              {`${t('SIGNATURE_REQUEST.DAPP_NAME_PREFIX')} ${payload.appDetails?.name}`}
            </RequestSource>
          ) : null}
          {(isUtf8Message(messageType) || isSignMessageBip322) && (
            <SignatureRequestMessage request={payload as SignaturePayload} />
          )}
          {!isSignMessageBip322 && isStructuredMessage(messageType) && (
            <SignatureRequestStructuredData payload={payload as StructuredDataSignaturePayload} />
          )}
          <CollapsableContainer
            text={getMessageHash()}
            title={t('SIGNATURE_REQUEST.MESSAGE_HASH_HEADER')}
          >
            <MessageHash>{getMessageHash()}</MessageHash>
          </CollapsableContainer>
          <SigningAddressContainer>
            <SigningAddressTitle>
              {t('SIGNATURE_REQUEST.SIGNING_ADDRESS_TITLE')}
            </SigningAddressTitle>
            <SigningAddress>
              {addressType && <SigningAddressType>{addressType}</SigningAddressType>}
              <SigningAddressValue>
                {getTruncatedAddress(payload.address || payload.stxAddress, 6)}
              </SigningAddressValue>
            </SigningAddress>
          </SigningAddressContainer>
          <ActionDisclaimer>{t('SIGNATURE_REQUEST.ACTION_DISCLAIMER')}</ActionDisclaimer>
          <InfoContainer bodyText={t('SIGNATURE_REQUEST.SIGNING_WARNING')} />
        </MainContainer>
      )}
      <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        {currentStepIndex === 0 && (
          <LedgerConnectionView
            title={t('SIGNATURE_REQUEST.LEDGER.CONNECT.TITLE')}
            text={t('SIGNATURE_REQUEST.LEDGER.CONNECT.SUBTITLE', {
              name: isSignMessageBip322 ? 'Bitcoin' : 'Stacks',
            })}
            titleFailed={t('SIGNATURE_REQUEST.LEDGER.CONNECT.ERROR_TITLE')}
            textFailed={t('SIGNATURE_REQUEST.LEDGER.CONNECT.ERROR_SUBTITLE')}
            imageDefault={isSignMessageBip322 ? ledgerConnectBtcIcon : ledgerConnectStxIcon}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        )}
        {currentStepIndex === 1 && (
          <LedgerConnectionView
            title={t('SIGNATURE_REQUEST.LEDGER.CONFIRM.TITLE')}
            text={t('SIGNATURE_REQUEST.LEDGER.CONFIRM.SUBTITLE')}
            titleFailed={t(
              isTxRejected
                ? 'SIGNATURE_REQUEST.LEDGER.CONFIRM.DENIED.ERROR_TITLE'
                : 'SIGNATURE_REQUEST.LEDGER.CONFIRM.ERROR_TITLE',
            )}
            textFailed={t(
              isTxRejected
                ? 'SIGNATURE_REQUEST.LEDGER.CONFIRM.DENIED.ERROR_SUBTITLE'
                : 'SIGNATURE_REQUEST.LEDGER.CONFIRM.ERROR_SUBTITLE',
            )}
            imageDefault={ledgerConnectDefaultIcon}
            isConnectSuccess={isTxApproved}
            isConnectFailed={isTxRejected || isConnectFailed}
          />
        )}
        <SuccessActionsContainer>
          <ActionButton
            onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
            text={t(
              isTxRejected || isConnectFailed
                ? 'SIGNATURE_REQUEST.LEDGER.RETRY_BUTTON'
                : 'SIGNATURE_REQUEST.LEDGER.CONNECT_BUTTON',
            )}
            disabled={isButtonDisabled}
            processing={isButtonDisabled}
          />
          <ActionButton
            onPress={cancelCallback}
            text={t('SIGNATURE_REQUEST.LEDGER.CANCEL_BUTTON')}
            transparent
          />
        </SuccessActionsContainer>
      </BottomModal>
    </ConfirmScreen>
  );
}

export default SignatureRequest;
