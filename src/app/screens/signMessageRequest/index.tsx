import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { delay } from '@common/utils/ledger';
import { sendSignMessageSuccessResponseMessage } from '@common/utils/rpc/responseMessages/bitcoin';
import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import AccountHeaderComponent from '@components/accountHeader';
import BottomModal from '@components/bottomModal';
import ConfirmScreen from '@components/confirmScreen';
import InfoContainer from '@components/infoContainer';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import RequestError from '@components/requests/requestError';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { MessageSigningProtocols, type Return } from '@sats-connect/core';
import CollapsableContainer from '@screens/signatureRequest/collapsableContainer';
import SignatureRequestMessage from '@screens/signatureRequest/signatureRequestMessage';
import { finalizeMessageSignature } from '@screens/signatureRequest/utils';
import { bip0322Hash, legacyHash } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { getTruncatedAddress, isHardwareAccount } from '@utils/helper';
import { handleLedgerMessageSigning } from '@utils/ledger';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionDisclaimer,
  MainContainer,
  MessageHash,
  RequestType,
  SigningAddress,
  SigningAddressContainer,
  SigningAddressTitle,
  SigningAddressType,
  SigningAddressValue,
  SuccessActionsContainer,
} from './index.styled';
import { useSignMessageRequest, useSignMessageValidation } from './useSignMessageRequest';

function SignMessageRequest() {
  const { t } = useTranslation('translation');
  const selectedAccount = useSelectedAccount();
  const { accountsList, network } = useWalletSelector();
  const { payload, tabId, requestToken, confirmSignMessage, requestId } = useSignMessageRequest();
  const { validationError, setValidationError } = useSignMessageValidation(payload);

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
      const signedMessage = await handleLedgerMessageSigning({
        transport,
        addressIndex: selectedAccount.deviceAccountIndex,
        address: payload.address,
        networkType: network.type,
        message: payload.message,
        protocol: payload.protocol,
      });
      if (requestToken) {
        const signingMessage = {
          source: MESSAGE_SOURCE,
          method: SatsConnectMethods.signMessageResponse,
          payload: {
            signMessageRequest: requestToken,
            signMessageResponse: signedMessage.signature,
          },
        };
        chrome.tabs.sendMessage(+tabId, signingMessage);
        window.close();
      }
      const signMessageResult: Return<'signMessage'> = {
        address: payload.address,
        messageHash:
          payload.protocol === MessageSigningProtocols.BIP322
            ? bip0322Hash(payload.message)
            : legacyHash(payload.message).toString('base64'),
        signature: signedMessage.signature,
        protocol: signedMessage.protocol as MessageSigningProtocols,
      };

      sendSignMessageSuccessResponseMessage({
        tabId: +tabId,
        messageId: requestId,
        result: signMessageResult,
      });
      window.close();
    } catch (e: any) {
      setValidationError({ error: e.message });
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
      sendUserRejectionMessage({
        tabId: +tabId,
        messageId: requestId,
      });
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
      const signedMessage = await confirmSignMessage();
      if (requestToken) {
        const signingMessage = {
          source: MESSAGE_SOURCE,
          method: SatsConnectMethods.signMessageResponse,
          payload: {
            signMessageRequest: requestToken,
            signMessageResponse: signedMessage.signature,
          },
        };
        chrome.tabs.sendMessage(+tabId, signingMessage);
      } else {
        const signMessageResult: Return<'signMessage'> = {
          address: payload.address,
          messageHash:
            payload.protocol === MessageSigningProtocols.BIP322
              ? bip0322Hash(payload.message)
              : legacyHash(payload.message).toString('base64'),
          signature: signedMessage.signature,
          protocol: signedMessage.protocol,
        };
        sendSignMessageSuccessResponseMessage({
          tabId: +tabId,
          messageId: requestId,
          result: signMessageResult,
        });
      }
      window.close();
    } catch (err) {
      setValidationError({ error: (err as any).message });
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

  if (validationError) {
    return <RequestError error={validationError.error} onClose={cancelCallback} />;
  }

  return (
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
  );
}

export default SignMessageRequest;
