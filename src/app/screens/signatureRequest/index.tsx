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
import { getNetworkType } from '@utils/helper';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '@components/infoContainer';
import { hashMessage } from '@secretkeylabs/xverse-core/wallet';
import { bip0322Hash } from '@secretkeylabs/xverse-core/connect/bip322Signature';
import { ExternalSatsMethods, MESSAGE_SOURCE } from '@common/types/message-types';
import SignatureRequestMessage from './signatureRequestMessage';
import SignatureRequestStructuredData from './signatureRequestStructuredData';
import { finalizeMessageSignature } from './utils';
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
  marginTop: props.theme.spacing(21),
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

const ActionDisclaimer = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[400],
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(8),
}));

function SignatureRequest(): JSX.Element {
  const { t } = useTranslation('translation');
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const { selectedAccount, accountsList, network } = useWalletSelector();
  const { switchAccount } = useWalletReducer();
  const {
    messageType, request, payload, tabId, domain, isSignMessageBip322,
  } = useSignatureRequest();

  const navigate = useNavigate();

  const switchAccountBasedOnRequest = () => {
    if (!isSignMessageBip322 && getNetworkType(payload.network) !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error:
            'There’s a mismatch between your active network and the network you’re logged with.',
          browserTx: true,
        },
      });
      return;
    }
    if (!isSignMessageBip322 && payload.stxAddress !== selectedAccount?.stxAddress) {
      const account = accountsList.find((acc) => acc.stxAddress === payload.stxAddress);
      if (account) {
        switchAccount(account);
      } else {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'STX',
            error:
              'There’s a mismatch between your active  address and the address you’re logged with.',
            browserTx: true,
          },
        });
      }
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

  const getMessageHash = useCallback(() => {
    if (!isSignMessageBip322) {
      return bytesToHex(hashMessage(payload.message));
    }
    return bip0322Hash(payload.message);
  }, [isSignMessageBip322]);

  return (
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
        <ActionDisclaimer>{t('SIGNATURE_REQUEST.ACTION_DISCLAIMER')}</ActionDisclaimer>
        <InfoContainer bodyText={t('SIGNATURE_REQUEST.SIGNING_WARNING')} />
      </MainContainer>
    </ConfirmScreen>
  );
}

export default SignatureRequest;
