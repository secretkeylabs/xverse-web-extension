import styled from 'styled-components';
import ConfirmScreen from '@components/confirmScreen';
import useSignatureRequest, {
  isStructuredMessage,
  isUtf8Message,
  useSignMessage,
} from '@hooks/useSignatureRequest';
import SignatureIcon from '@assets/img/webInteractions/signatureIcon.svg';
import Plus from '@assets/img/transactions/Plus.svg';
import Minus from '@assets/img/transactions/Minus.svg';
import AccountHeaderComponent from '@components/accountHeader';
import Info from '@assets/img/send/info.svg';
import { useTranslation } from 'react-i18next';
import { SignaturePayload, StructuredDataSignaturePayload } from '@stacks/connect';
import { useState } from 'react';
import Seperator from '@components/seperator';
import { bytesToHex } from '@stacks/transactions';
import { hashMessage } from '@stacks/encryption';
import SignatureRequestMessage from './signatureRequestMessage';
import SignatureRequestStructuredData from './signatureRequestStructuredData';
import { finalizeMessageSignature } from './utils';

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  flex: 1,
  height: '100%',
}));

const RequestImage = styled.img((props) => ({
  marginTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(12),
  alignSelf: 'center',
}));

const RequestType = styled.h1((props) => ({
  ...props.theme.headline_m,
  color: props.theme.colors.white[0],
  textAlign: 'center',
}));

const RequestSource = styled.h2((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(2),
  marginBottom: props.theme.spacing(12),
  textAlign: 'center',
}));

const ShowHashButtonContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  div: {
    flex: 1,
  },
});

const ShowHashButton = styled.button((props) => ({
  ...props.theme.body_xs,
  background: 'none',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(6),
  marginTop: props.theme.spacing(12),
  width: 111,
  height: 34,
  borderRadius: props.theme.radius(3),
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  img: {
    marginLeft: props.theme.spacing(2),
  },
}));

const MessageHashTitle = styled.p((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white[200],
  marginBottom: props.theme.spacing(2),
  opacity: 0.7,
}));

const MessageHash = styled.p((props) => ({
  ...props.theme.body_m,
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

const WarningMessageContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  border: `2px solid ${props.theme.colors.grey}`,
  borderRadius: props.theme.radius(2),
  padding: props.theme.spacing(6),
  p: {
    ...props.theme.body_m,
    color: props.theme.colors.white[200],
    marginLeft: props.theme.spacing(9),
    lineHeight: 1.4,
  },
}));

function SignatureRequest(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'SIGNATURE_REQUEST' });
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [showHash, setShowHash] = useState(false);
  const {
    messageType, request, payload, tabId, domain,
  } = useSignatureRequest();

  const handleMessageSigning = useSignMessage(messageType);

  const cancelCallback = () => {
    finalizeMessageSignature({ requestPayload: request, tabId: +tabId, data: 'cancel' });
    window.close();
  };

  const handleShowHash = async () => {
    setShowHash((current) => !current);
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
      cancelText={t('CANCEL_BUTTON')}
      confirmText={t('SIGN_BUTTON')}
      loading={isSigning}
    >
      <AccountHeaderComponent />
      <MainContainer>
        <RequestImage src={SignatureIcon} alt="Signature" width={80} />
        <RequestType>{t('TITLE')}</RequestType>
        <RequestSource>{`${t('DAPP_NAME_PREFIX')} ${payload.appDetails?.name}`}</RequestSource>
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
        <ShowHashButtonContainer>
          <Seperator />
          <ShowHashButton onClick={handleShowHash}>
            {showHash ? t('HIDE_HASH_BUTTON') : t('SHOW_HASH_BUTTON')}
            <img src={showHash ? Minus : Plus} alt="Show" />
          </ShowHashButton>
          <Seperator />
        </ShowHashButtonContainer>
        {showHash ? (
          <>
            <MessageHashTitle>{t('MESSAGE_HASH_HEADER')}</MessageHashTitle>
            <MessageHash>{bytesToHex(hashMessage(payload.message))}</MessageHash>
          </>
        ) : null}
        <ActionDisclaimer>{t('ACTION_DISCLAIMER')}</ActionDisclaimer>
        <WarningMessageContainer>
          <img src={Info} alt="warning" />
          <p>{t('SIGNING_WARNING')}</p>
        </WarningMessageContainer>
      </MainContainer>
    </ConfirmScreen>
  );
}

export default SignatureRequest;
