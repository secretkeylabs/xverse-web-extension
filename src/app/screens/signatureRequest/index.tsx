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
import { useTranslation } from 'react-i18next';
import { SignaturePayload, StructuredDataSignaturePayload } from '@stacks/connect';
import { useEffect, useState } from 'react';
import Seperator from '@components/seperator';
import { bytesToHex } from '@stacks/transactions';
import useWalletSelector from '@hooks/useWalletSelector';
import useWalletReducer from '@hooks/useWalletReducer';
import { getNetworkType, isHardwareAccount, isLedgerAccount } from '@utils/helper';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '@components/infoContainer';
import { hashMessage, signStxMessage } from '@secretkeylabs/xverse-core';
import SignatureRequestMessage from './signatureRequestMessage';
import SignatureRequestStructuredData from './signatureRequestStructuredData';
import { finalizeMessageSignature } from './utils';
import BottomModal from '@components/bottomModal';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import LedgerConnectDefault from '@assets/img/ledger/ledger_connect_default.svg';
import ActionButton from '@components/button';
import Transport from '@ledgerhq/hw-transport-webusb';
import { ledgerDelay } from '@common/utils/ledger';
import { signatureVrsToRsv } from '@stacks/common';

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

function SignatureRequest(): JSX.Element {
  const { t } = useTranslation('translation');
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [showHash, setShowHash] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState<boolean>(false);
  const [isConnectFailed, setIsConnectFailed] = useState<boolean>(false);
  const [isTxApproved, setIsTxApproved] = useState<boolean>(false);
  const [isTxRejected, setIsTxRejected] = useState<boolean>(false);
  const { selectedAccount, accountsList, network } = useWalletSelector();
  const { switchAccount } = useWalletReducer();
  const { messageType, request, payload, tabId, domain } = useSignatureRequest();
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

  const handleShowHash = async () => {
    setShowHash((current) => !current);
  };

  const confirmCallback = async () => {
    try {
      setIsSigning(true);
      if (isHardwareAccount(selectedAccount)) {
        setIsModalVisible(true);
        return;
      }
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
      const signature = await signStxMessage(transport, payload.message, selectedAccount.id);
      const rsvSignature = signatureVrsToRsv(signature.signatureVRS.toString('hex'));
      const data = {
        signature: rsvSignature,
        publicKey: selectedAccount.stxPublicKey,
      };
      if (signature) {
        finalizeMessageSignature({ requestPayload: request, tabId: +tabId, data });
      }
    } catch (e) {
      console.error(e);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
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
      cancelText={t('SIGNATURE_REQUEST.CANCEL_BUTTON')}
      confirmText={t('SIGNATURE_REQUEST.SIGN_BUTTON')}
      loading={isSigning}
    >
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <MainContainer>
        <RequestImage src={SignatureIcon} alt="Signature" width={80} />
        <RequestType>{t('SIGNATURE_REQUEST.TITLE')}</RequestType>
        <RequestSource>{`${t('SIGNATURE_REQUEST.DAPP_NAME_PREFIX')} ${
          payload.appDetails?.name
        }`}</RequestSource>
        {isUtf8Message(messageType) && (
          <SignatureRequestMessage request={payload as SignaturePayload} />
        )}
        {isStructuredMessage(messageType) && (
          <SignatureRequestStructuredData payload={payload as StructuredDataSignaturePayload} />
        )}
        <ShowHashButtonContainer>
          <Seperator />
          <ShowHashButton onClick={handleShowHash}>
            {showHash
              ? t('SIGNATURE_REQUEST.HIDE_HASH_BUTTON')
              : t('SIGNATURE_REQUEST.SHOW_HASH_BUTTON')}
            <img src={showHash ? Minus : Plus} alt="Show" />
          </ShowHashButton>
          <Seperator />
        </ShowHashButtonContainer>
        {showHash ? (
          <>
            <MessageHashTitle>{t('SIGNATURE_REQUEST.MESSAGE_HASH_HEADER')}</MessageHashTitle>
            <MessageHash>{bytesToHex(hashMessage(payload.message))}</MessageHash>
          </>
        ) : null}
        <ActionDisclaimer>{t('SIGNATURE_REQUEST.ACTION_DISCLAIMER')}</ActionDisclaimer>
        <InfoContainer bodyText={t('SIGNATURE_REQUEST.SIGNING_WARNING')} />
      </MainContainer>
      <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        {currentStepIndex === 0 ? (
          <LedgerConnectionView
            title={t('SIGNATURE_REQUEST.LEDGER.CONNECT.TITLE')}
            text={t('SIGNATURE_REQUEST.LEDGER.CONNECT.SUBTITLE')}
            titleFailed={t('SIGNATURE_REQUEST.LEDGER.CONNECT.ERROR_TITLE')}
            textFailed={t('SIGNATURE_REQUEST.LEDGER.CONNECT.ERROR_SUBTITLE')}
            imageDefault={LedgerConnectDefault}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        ) : currentStepIndex === 1 ? (
          <LedgerConnectionView
            title={t('SIGNATURE_REQUEST.LEDGER.CONFIRM.TITLE')}
            text={t('SIGNATURE_REQUEST.LEDGER.CONFIRM.SUBTITLE')}
            titleFailed={t('SIGNATURE_REQUEST.LEDGER.CONFIRM.ERROR_TITLE')}
            textFailed={t('SIGNATURE_REQUEST.LEDGER.CONFIRM.ERROR_SUBTITLE')}
            imageDefault={LedgerConnectDefault}
            isConnectSuccess={isTxApproved}
            isConnectFailed={isTxRejected}
          />
        ) : null}
        <SuccessActionsContainer>
          <ActionButton
            onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
            text={t(
              isTxRejected || isConnectFailed
                ? 'SIGNATURE_REQUEST.LEDGER.RETRY_BUTTON'
                : 'SIGNATURE_REQUEST.LEDGER.CONNECT_BUTTON'
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
