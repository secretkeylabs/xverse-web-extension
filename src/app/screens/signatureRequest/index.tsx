import styled from 'styled-components';
import ConfirmScreen from '@components/confirmScreen';
import useSignatureRequest, {
  isStructuredMessage,
  isUtf8Message,
  useSignMessage,
} from '@hooks/useSignatureRequest';
import AccountHeaderComponent from '@components/accountHeader';
import { useTranslation } from 'react-i18next';
import { SignaturePayload, StructuredDataSignaturePayload } from '@stacks/connect';
import { useEffect, useState } from 'react';
import { bytesToHex } from '@stacks/transactions';
import useWalletSelector from '@hooks/useWalletSelector';
import useWalletReducer from '@hooks/useWalletReducer';
import { getNetworkType } from '@utils/helper';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '@components/infoContainer';
import { hashMessage } from '@secretkeylabs/xverse-core';
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
}));

const RequestSource = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[400],
  marginTop: props.theme.spacing(4),
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
  marginBottom: props.theme.spacing(8),
}));

function SignatureRequest(): JSX.Element {
  const { t } = useTranslation('translation');
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const { selectedAccount, accountsList, network } = useWalletSelector();
  const { switchAccount } = useWalletReducer();
  const {
    messageType, request, payload, tabId, domain,
  } = useSignatureRequest();
  const navigate = useNavigate();
  const switchAccountBasedOnRequest = () => {
    if (getNetworkType(payload.network) !== network.type) {
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
    if (payload.stxAddress !== selectedAccount?.stxAddress) {
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

  const cancelCallback = () => {
    finalizeMessageSignature({ requestPayload: request, tabId: +tabId, data: 'cancel' });
    window.close();
  };

  const confirmCallback = async () => {
    try {
      setIsSigning(true);
      const signature = await handleMessageSigning({
        message: payload.message,
        domain: domain || undefined,
      });
      if (signature) {
        finalizeMessageSignature({ requestPayload: request, tabId: +tabId, data: signature });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsSigning(false);
    }
  };

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
        <RequestSource>{`${t('SIGNATURE_REQUEST.DAPP_NAME_PREFIX')} ${payload.appDetails?.name}`}</RequestSource>
        {isUtf8Message(messageType) && (
          <SignatureRequestMessage
            request={payload as SignaturePayload}
          />
        )}
        {isStructuredMessage(messageType) && (
          <SignatureRequestStructuredData
            payload={payload as StructuredDataSignaturePayload}
          />
        )}
        <CollapsableContainer text={bytesToHex(hashMessage(payload.message))} title={t('SIGNATURE_REQUEST.MESSAGE_HASH_HEADER')}>
          <MessageHash>{bytesToHex(hashMessage(payload.message))}</MessageHash>
        </CollapsableContainer>
        <ActionDisclaimer>{t('SIGNATURE_REQUEST.ACTION_DISCLAIMER')}</ActionDisclaimer>
        <InfoContainer bodyText={t('SIGNATURE_REQUEST.SIGNING_WARNING')} />
      </MainContainer>
    </ConfirmScreen>
  );
}

export default SignatureRequest;
