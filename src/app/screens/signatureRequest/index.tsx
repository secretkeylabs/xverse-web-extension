import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
import { delay } from '@common/utils/ledger';
import { makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import AccountHeaderComponent from '@components/accountHeader';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import ConfirmScreen from '@components/confirmScreen';
import InfoContainer from '@components/infoContainer';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import useSignatureRequest, {
  isStructuredMessage,
  isUtf8Message,
  useSignMessage,
} from '@hooks/useSignatureRequest';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { buf2hex, hashMessage, signStxMessage } from '@secretkeylabs/xverse-core';
import { SignaturePayload, StructuredDataSignaturePayload } from '@stacks/connect';
import { getNetworkType, getTruncatedAddress, isHardwareAccount } from '@utils/helper';
import { signatureVrsToRsv } from '@utils/ledger';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Return } from 'sats-connect';
import styled from 'styled-components';
import CollapsableContainer from './collapsableContainer';
import SignatureRequestMessage from './signatureRequestMessage';
import SignatureRequestStructuredData from './signatureRequestStructuredData';
import { finalizeMessageSignature } from './utils';

const OuterContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const InnerContainer = styled.div((props) => ({
  flex: 1,
  ...props.theme.scrollbar,
}));

export const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
}));

const RequestType = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(11),
  color: props.theme.colors.white_0,
  textAlign: 'left',
  marginBottom: props.theme.spacing(4),
}));

const RequestSource = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_400,
  textAlign: 'left',
  marginBottom: props.theme.spacing(12),
}));

const MessageHash = styled.p((props) => ({
  ...props.theme.body_medium_m,
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
  ...props.theme.body_medium_m,
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
  ...props.theme.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

const SigningAddressValue = styled.p((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

const ActionDisclaimer = styled.p((props) => ({
  ...props.theme.body_m,
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
  const [isTxInvalid, setIsTxInvalid] = useState(false);
  const { selectedAccount, accountsList, network } = useWalletSelector();
  const [addressType, setAddressType] = useState('');
  const { switchAccount } = useWalletReducer();
  const { messageType, requestToken, payload, tabId, domain, requestId } = useSignatureRequest();
  const navigate = useNavigate();
  const isMessageSigningDisabled =
    isHardwareAccount(selectedAccount) && !selectedAccount?.stxAddress;

  const checkAddressAvailability = () => {
    const account = accountsList.filter((acc) => {
      if (acc.stxAddress === payload.stxAddress) {
        setAddressType(t('SIGNATURE_REQUEST.SIGNING_ADDRESS_STX'));
        return true;
      }
      return false;
    });
    return isHardwareAccount(selectedAccount) ? account[0] || selectedAccount : account[0];
  };

  const switchAccountBasedOnRequest = () => {
    if (getNetworkType(payload.network) !== network.type) {
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

  const cancelCallback = () => {
    if (requestToken) {
      finalizeMessageSignature({ requestPayload: requestToken, tabId: +tabId, data: 'cancel' });
    }
    window.close();
  };

  const confirmCallback = async () => {
    try {
      setIsSigning(true);
      if (isHardwareAccount(selectedAccount) && !isMessageSigningDisabled) {
        setIsModalVisible(true);
        return;
      }
      const signature = await handleMessageSigning({
        message: payload.message,
        domain: (domain as any) || undefined, // TODO fix type error
      });
      if (signature) {
        if (requestToken) {
          finalizeMessageSignature({
            requestPayload: requestToken,
            tabId: +tabId,
            data: signature,
          });
        } else {
          const result: Return<'stx_signMessage' | 'stx_signStructuredMessage'> = {
            signature: signature.signature,
            publicKey: signature.publicKey,
          };
          const response = makeRpcSuccessResponse(requestId, result);
          sendRpcResponse(+tabId, response);
          window.close();
        }
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
    await delay(1500);
    setCurrentStepIndex(1);

    try {
      const signature = await signStxMessage({
        transport,
        message: payload.message,
        accountIndex: 0,
        addressIndex: selectedAccount.deviceAccountIndex,
      });
      if (
        !!signature.errorMessage &&
        signature.errorMessage !== 'No errors' && // @zondax/ledger-stacks npm package returns this string when there are no errors
        !!signature.returnCode
      ) {
        throw new Error(signature.errorMessage, {
          cause: signature.returnCode,
        });
      }
      const rsvSignature = signatureVrsToRsv(signature.signatureVRS.toString('hex'));
      const data = {
        signature: rsvSignature,
        publicKey: selectedAccount.stxPublicKey,
      };
      if (requestToken) {
        if (signature) {
          finalizeMessageSignature({ requestPayload: requestToken, tabId: +tabId, data });
        }
      } else {
        const result: Return<'stx_signMessage' | 'stx_signStructuredMessage'> = {
          signature: rsvSignature,
          publicKey: selectedAccount.stxPublicKey,
        };
        const response = makeRpcSuccessResponse(requestId, result);
        sendRpcResponse(+tabId, response);
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

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsTxInvalid(false);
    setIsConnectFailed(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  const getMessageHash = useCallback(
    () => buf2hex(hashMessage(payload.message)),
    [payload.message],
  );

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

  return (
    <ConfirmScreen
      onConfirm={confirmCallback}
      onCancel={cancelCallback}
      cancelText={t('SIGNATURE_REQUEST.CANCEL_BUTTON')}
      confirmText={t('SIGNATURE_REQUEST.SIGN_BUTTON')}
      loading={isSigning}
      disabled={isMessageSigningDisabled}
    >
      <OuterContainer>
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />

        <InnerContainer>
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
              <RequestSource>
                {`${t('SIGNATURE_REQUEST.DAPP_NAME_PREFIX')} ${payload.appDetails?.name}`}
              </RequestSource>
              {isUtf8Message(messageType) && (
                <SignatureRequestMessage message={(payload as SignaturePayload).message} />
              )}
              {isStructuredMessage(messageType) && (
                <SignatureRequestStructuredData
                  payload={payload as StructuredDataSignaturePayload}
                />
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
                    {getTruncatedAddress(payload.stxAddress, 6)}
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
                  name: 'Stacks',
                })}
                titleFailed={t('SIGNATURE_REQUEST.LEDGER.CONNECT.ERROR_TITLE')}
                textFailed={t('SIGNATURE_REQUEST.LEDGER.CONNECT.ERROR_SUBTITLE')}
                imageDefault={ledgerConnectStxIcon}
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
              <ActionButton
                onPress={
                  isTxRejected || isTxInvalid || isConnectFailed
                    ? handleRetry
                    : handleConnectAndConfirm
                }
                text={t(
                  isTxRejected || isTxInvalid || isConnectFailed
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
        </InnerContainer>
      </OuterContainer>
    </ConfirmScreen>
  );
}

export default SignatureRequest;
