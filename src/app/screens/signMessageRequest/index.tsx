import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { delay } from '@common/utils/ledger';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import AccountHeaderComponent from '@components/accountHeader';
import BottomModal from '@components/bottomModal';
import ConfirmScreen from '@components/confirmScreen';
import InfoContainer from '@components/infoContainer';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import RequestError from '@components/requests/requestError';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { Return, RpcErrorCode } from '@sats-connect/core';
import CollapsableContainer from '@screens/signatureRequest/collapsableContainer';
import SignatureRequestMessage from '@screens/signatureRequest/signatureRequestMessage';
import { finalizeMessageSignature } from '@screens/signatureRequest/utils';
import { bip0322Hash } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { getTruncatedAddress, isHardwareAccount } from '@utils/helper';
import { handleBip322LedgerMessageSigning } from '@utils/ledger';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useSignMessageRequest, useSignMessageValidation } from './useSignMessageRequest';

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const RequestType = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  marginTop: props.theme.spacing(11),
  color: props.theme.colors.white_0,
  textAlign: 'left',
  marginBottom: props.theme.spacing(12),
}));

const MessageHash = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  lineHeight: 1.6,
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

const SigningAddressContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  marginBottom: props.theme.spacing(6),
  flex: 1,
}));

const SigningAddressTitle = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  wordWrap: 'break-word',
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(4),
}));

const SigningAddress = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const SigningAddressType = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

const SigningAddressValue = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

const ActionDisclaimer = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_400,
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

function SignMessageRequest() {
  const { t } = useTranslation('translation');
  const { accountsList, selectedAccount, network } = useWalletSelector();
  const { payload, tabId, requestToken, confirmSignMessage, requestId } = useSignMessageRequest();
  const { validationError } = useSignMessageValidation(payload);

  const [addressType, setAddressType] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  // Ledger state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const [isTxInvalid, setIsTxInvalid] = useState(false);

  useEffect(() => {
    const checkAddressAvailability = () => {
      const account = accountsList.filter((acc) => {
        if (acc.btcAddress === payload.address) {
          setAddressType(t('SIGNATURE_REQUEST.SIGNING_ADDRESS_SEGWIT'));
          return true;
        }
        if (acc.ordinalsAddress === payload?.address) {
          setAddressType(t('SIGNATURE_REQUEST.SIGNING_ADDRESS_TAPROOT'));
          return true;
        }
        return false;
      });
      return isHardwareAccount(selectedAccount) ? account[0] || selectedAccount : account[0];
    };
    checkAddressAvailability();
  }, [payload]);

  const getConfirmationError = (type: 'title' | 'subtitle') => {
    if (type === 'title') {
      if (isTxRejected) {
        return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.DENIED.ERROR_TITLE');
      }

      if (isTxInvalid) {
        return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.INVALID.ERROR_TITLE');
      }

      return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.ERROR_TITLE');
    }

    if (isTxRejected) {
      return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.DENIED.ERROR_SUBTITLE');
    }

    if (isTxInvalid) {
      return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.INVALID.ERROR_SUBTITLE');
    }

    return t('SIGNATURE_REQUEST.LEDGER.CONFIRM.ERROR_SUBTITLE');
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
    await delay(1500);
    setCurrentStepIndex(1);

    try {
      const signature = await handleBip322LedgerMessageSigning({
        transport,
        addressIndex: selectedAccount.deviceAccountIndex,
        address: payload.address,
        networkType: network.type,
        message: payload.message,
      });
      const signingMessage = {
        source: MESSAGE_SOURCE,
        method: SatsConnectMethods.signMessageResponse,
        payload: {
          signMessageRequest: requestToken,
          signMessageResponse: signature,
        },
      };
      chrome.tabs.sendMessage(+tabId, signingMessage);
      window.close();
    } catch (e: any) {
      console.error(e);

      if (e.name === 'LockedDeviceError') {
        setCurrentStepIndex(0);
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
      } else if (e.statusCode === 28160) {
        setIsConnectSuccess(false);
        setIsConnectFailed(true);
      } else if (e.cause === 27012) {
        setIsTxInvalid(true);
      } else {
        setIsTxRejected(true);
      }
    } finally {
      await transport.close();
      setIsButtonDisabled(false);
    }
  };

  const cancelCallback = () => {
    if (requestToken) {
      finalizeMessageSignature({ requestPayload: requestToken, tabId: +tabId, data: 'cancel' });
    } else {
      const cancelError = makeRPCError(requestId, {
        code: RpcErrorCode.USER_REJECTION,
        message: 'User rejected the request.',
      });
      sendRpcResponse(+tabId, cancelError);
    }
    window.close();
  };

  const confirmCallback = async () => {
    if (!payload) return;
    try {
      setIsSigning(true);
      if (isHardwareAccount(selectedAccount)) {
        setIsModalVisible(true);
        return;
      }
      const bip322signature = await confirmSignMessage();
      if (requestToken) {
        const signingMessage = {
          source: MESSAGE_SOURCE,
          method: SatsConnectMethods.signMessageResponse,
          payload: {
            signMessageRequest: requestToken,
            signMessageResponse: bip322signature,
          },
        };
        chrome.tabs.sendMessage(+tabId, signingMessage);
      } else {
        const signMessageResult: Return<'signMessage'> = {
          address: payload.address,
          messageHash: bip0322Hash(payload.message),
          signature: bip322signature ?? '',
        };
        const response = makeRpcSuccessResponse(requestId, signMessageResult);
        sendRpcResponse(+tabId, response);
      }
      window.close();
    } catch (err) {
      console.log(err);
    } finally {
      setIsSigning(false);
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsTxInvalid(false);
    setIsConnectFailed(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  return !validationError ? (
    <>
      <ConfirmScreen
        onConfirm={confirmCallback}
        onCancel={cancelCallback}
        cancelText={t('SIGNATURE_REQUEST.CANCEL_BUTTON')}
        confirmText={t('SIGNATURE_REQUEST.SIGN_BUTTON')}
        loading={isSigning}
      >
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />
        <MainContainer>
          <RequestType>{t('SIGNATURE_REQUEST.TITLE')}</RequestType>
          <SignatureRequestMessage message={payload.message} />
          <CollapsableContainer
            text={bip0322Hash(payload.message)}
            title={t('SIGNATURE_REQUEST.MESSAGE_HASH_HEADER')}
          >
            <MessageHash>{bip0322Hash(payload.message)}</MessageHash>
          </CollapsableContainer>
          <SigningAddressContainer>
            <SigningAddressTitle>
              {t('SIGNATURE_REQUEST.SIGNING_ADDRESS_TITLE')}
            </SigningAddressTitle>
            <SigningAddress>
              {addressType && <SigningAddressType>{addressType}</SigningAddressType>}
              <SigningAddressValue>{getTruncatedAddress(payload.address, 6)}</SigningAddressValue>
            </SigningAddress>
          </SigningAddressContainer>
          <ActionDisclaimer>{t('SIGNATURE_REQUEST.ACTION_DISCLAIMER')}</ActionDisclaimer>
          <InfoContainer bodyText={t('SIGNATURE_REQUEST.SIGNING_WARNING')} type="Info" />
        </MainContainer>
      </ConfirmScreen>
      <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        {currentStepIndex === 0 && (
          <LedgerConnectionView
            title={t('SIGNATURE_REQUEST.LEDGER.CONNECT.TITLE')}
            text={t('SIGNATURE_REQUEST.LEDGER.CONNECT.SUBTITLE', {
              name: 'Bitcoin',
            })}
            titleFailed={t('SIGNATURE_REQUEST.LEDGER.CONNECT.ERROR_TITLE')}
            textFailed={t('SIGNATURE_REQUEST.LEDGER.CONNECT.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectBtcIcon}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        )}
        {currentStepIndex === 1 && (
          <LedgerConnectionView
            title={t('SIGNATURE_REQUEST.LEDGER.CONFIRM.TITLE')}
            text={t('SIGNATURE_REQUEST.LEDGER.CONFIRM.SUBTITLE')}
            titleFailed={getConfirmationError('title')}
            textFailed={getConfirmationError('subtitle')}
            imageDefault={ledgerConnectDefaultIcon}
            isConnectSuccess={isTxApproved}
            isConnectFailed={isTxRejected || isTxInvalid || isConnectFailed}
          />
        )}
        <SuccessActionsContainer>
          <Button
            onClick={
              isTxRejected || isTxInvalid || isConnectFailed ? handleRetry : handleConnectAndConfirm
            }
            title={t(
              isTxRejected || isTxInvalid || isConnectFailed
                ? 'SIGNATURE_REQUEST.LEDGER.RETRY_BUTTON'
                : 'SIGNATURE_REQUEST.LEDGER.CONNECT_BUTTON',
            )}
            disabled={isButtonDisabled}
            loading={isButtonDisabled}
            variant="primary"
          />
          <Button
            onClick={cancelCallback}
            title={t('SIGNATURE_REQUEST.LEDGER.CANCEL_BUTTON')}
            variant="secondary"
          />
        </SuccessActionsContainer>
      </BottomModal>
    </>
  ) : (
    <RequestError error={validationError.error} />
  );
}

export default SignMessageRequest;
