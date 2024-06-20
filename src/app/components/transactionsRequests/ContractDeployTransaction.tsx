import DownloadImage from '@assets/img/webInteractions/ArrowLineDown.svg';
import {
  sendDeployContractSuccessResponseMessage,
  sendInternalErrorMessage,
  sendSignTransactionSuccessResponseMessage,
  sendUserRejectionMessage,
} from '@common/utils/rpc/rpcResponseMessages';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmStxTransactionComponent from '@components/confirmStxTransactionComponent';
import InfoContainer from '@components/infoContainer';
import StxPostConditionCard from '@components/postCondition/stxPostConditionCard';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useNetworkSelector from '@hooks/useNetwork';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import { broadcastSignedTransaction, buf2hex, isMultiSig } from '@secretkeylabs/xverse-core';
import { MultiSigSpendingCondition, PostCondition, StacksTransaction } from '@stacks/transactions';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import finalizeTxSignature from './utils';

const Title = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_400,
  textTransform: 'uppercase',
}));

const DownloadContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 12,
}));

const PostConditionContainer = styled.div((props) => ({
  display: 'flex',
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  borderTop: `0.5px solid ${props.theme.colors.elevation3}`,
  borderBottom: `0.5px solid ${props.theme.colors.elevation3}`,
  flexDirection: 'column',
}));

const DownloadButtonContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'flex-end',
});

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
  marginRight: props.theme.spacing(2),
  textAlign: 'center',
}));

const ButtonImage = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const SponsoredContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const SponsoredTag = styled.div((props) => ({
  background: props.theme.colors.elevation3,
  marginTop: props.theme.spacing(7.5),
  paddingTop: props.theme.spacing(4),
  paddingBottom: props.theme.spacing(4),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  borderRadius: 30,
}));

const SponosredText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_0,
}));

const PostConditionAlertText = styled.h1((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white_0,
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
}));

interface ContractDeployRequestProps {
  unsignedTx: StacksTransaction;
  codeBody: string;
  contractName: string;
  sponsored: boolean;
  tabId: number;
  requestToken: string;
  messageId: string | null;
  rpcMethod: string | null;
}

export default function ContractDeployRequest(props: ContractDeployRequestProps) {
  const {
    unsignedTx,
    codeBody,
    contractName,
    sponsored,
    tabId,
    requestToken,
    messageId,
    rpcMethod,
  } = props;
  const selectedNetwork = useNetworkSelector();
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const { t } = useTranslation('translation');
  const [loaderForBroadcastingTx, setLoaderForBroadcastingTx] = useState<boolean>(false);
  const navigate = useNavigate();

  // SignTransaction Params
  const isMultiSigTx = isMultiSig(unsignedTx);
  const hasSignatures =
    isMultiSigTx &&
    (unsignedTx.auth.spendingCondition as MultiSigSpendingCondition).fields?.length > 0;

  useOnOriginTabClose(tabId, () => {
    setHasTabClosed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const broadcastTx = async (tx: StacksTransaction[]) => {
    try {
      setLoaderForBroadcastingTx(true);
      const txId = await broadcastSignedTransaction(tx[0], selectedNetwork);
      if (rpcMethod && messageId && tabId) {
        switch (rpcMethod) {
          case 'stx_signTransaction': {
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: buf2hex(tx[0].serialize()) },
            });
            break;
          }
          case 'stx_deployContract': {
            sendDeployContractSuccessResponseMessage({
              tabId,
              messageId,
              result: { txid: txId, transaction: buf2hex(tx[0].serialize()) },
            });
            break;
          }
          default:
            sendInternalErrorMessage({ tabId, messageId });
            break;
        }
      } else {
        finalizeTxSignature({
          requestPayload: requestToken,
          tabId,
          data: { txId, txRaw: buf2hex(tx[0].serialize()) },
        });
      }

      navigate('/tx-status', {
        state: {
          txid: txId,
          currency: 'STX',
          error: '',
          browserTx: true,
          tabId,
          requestToken,
        },
      });
    } catch (error: any) {
      setLoaderForBroadcastingTx(false);
      sendInternalErrorMessage({ tabId, messageId });
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: error.message,
          browserTx: true,
        },
      });
    } finally {
      setLoaderForBroadcastingTx(false);
    }
  };

  const confirmCallback = (txs: StacksTransaction[]) => {
    if (sponsored) {
      if (rpcMethod && messageId && tabId) {
        switch (rpcMethod) {
          case 'stx_signTransaction':
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: buf2hex(unsignedTx.serialize()) },
            });
            break;
          default:
            sendInternalErrorMessage({ tabId, messageId });
            break;
        }
        sendSignTransactionSuccessResponseMessage({
          tabId,
          messageId,
          result: { transaction: buf2hex(unsignedTx.serialize()) },
        });
      }
      navigate('/tx-status', {
        state: {
          sponsored: true,
          browserTx: true,
        },
      });
    } else if (isMultiSigTx) {
      if (rpcMethod && messageId && tabId) {
        switch (rpcMethod) {
          case 'stx_signTransaction':
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: buf2hex(unsignedTx.serialize()) },
            });
            break;
          default:
            sendInternalErrorMessage({ tabId, messageId });
            break;
        }
      } else {
        finalizeTxSignature({
          requestPayload: requestToken,
          tabId,
          data: { txId: '', txRaw: buf2hex(unsignedTx.serialize()) },
        });
      }
      window.close();
    } else {
      broadcastTx(txs);
    }
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([codeBody], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'code.clar';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const cancelCallback = () => {
    if (rpcMethod && messageId && tabId) {
      sendUserRejectionMessage({ tabId, messageId });
    }
    finalizeTxSignature({ requestPayload: requestToken, tabId, data: 'cancel' });
    window.close();
  };

  const showSponsoredTransactionTag = (
    <SponsoredContainer>
      <SponsoredTag>
        <SponosredText>{t('DEPLOY_CONTRACT_REQUEST.SPONSORED')}</SponosredText>
      </SponsoredTag>
    </SponsoredContainer>
  );

  const postConditionAlert = unsignedTx?.postConditionMode === 2 &&
    unsignedTx?.postConditions.values.length <= 0 && (
      <PostConditionContainer>
        <PostConditionAlertText>
          {t('DEPLOY_CONTRACT_REQUEST.POST_CONDITION_ALERT')}
        </PostConditionAlertText>
      </PostConditionContainer>
    );

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <ConfirmStxTransactionComponent
        initialStxTransactions={[unsignedTx!]}
        onConfirmClick={confirmCallback}
        onCancelClick={cancelCallback}
        loading={loaderForBroadcastingTx}
        isSponsored={sponsored}
        title={t('DEPLOY_CONTRACT_REQUEST.DEPLOY_CONTRACT')}
        hasSignatures={hasSignatures}
      >
        {hasTabClosed && (
          <InfoContainer
            titleText={t('WINDOW_CLOSED_ALERT.TITLE')}
            bodyText={t('WINDOW_CLOSED_ALERT.BODY')}
          />
        )}
        {postConditionAlert}
        {sponsored && showSponsoredTransactionTag}
        {unsignedTx?.postConditions?.values?.map((postCondition) => (
          <StxPostConditionCard postCondition={postCondition as PostCondition} />
        ))}
        <TransactionDetailComponent
          title={t('DEPLOY_CONTRACT_REQUEST.CONTRACT_NAME')}
          value={contractName}
        />
        <DownloadContainer>
          <Title>{t('DEPLOY_CONTRACT_REQUEST.FUNCTION')}</Title>
          <DownloadButtonContainer>
            <Button onClick={downloadCode}>
              <>
                <ButtonText>{t('DEPLOY_CONTRACT_REQUEST.DOWNLOAD')}</ButtonText>
                <ButtonImage src={DownloadImage} />
              </>
            </Button>
          </DownloadButtonContainer>
        </DownloadContainer>
      </ConfirmStxTransactionComponent>
    </>
  );
}
