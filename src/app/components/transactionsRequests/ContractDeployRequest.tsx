import DownloadImage from '@assets/img/webInteractions/ArrowLineDown.svg';

import {
  sendInternalErrorMessage,
  sendUserRejectionMessage,
} from '@common/utils/rpc/responseMessages/errors';
import {
  sendDeployContractSuccessResponseMessage,
  sendSignTransactionSuccessResponseMessage,
} from '@common/utils/rpc/responseMessages/stacks';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmStxTransactionComponent from '@components/confirmStxTransactionComponent';
import InfoContainer from '@components/infoContainer';
import StxPostConditionCard from '@components/postCondition/stxPostConditionCard';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useNetworkSelector from '@hooks/useNetwork';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import {
  broadcastSignedTransaction,
  extractFromPayload,
  isMultiSig,
  microstacksToStx,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core';
import {
  type MultiSigSpendingCondition,
  PostConditionMode,
  type StacksTransactionWire,
} from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import { useCallback, useState } from 'react';
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
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  marginRight: props.theme.spacing(2),
  textAlign: 'center',
}));

const ButtonImage = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const PostConditionAlertText = styled.h1((props) => ({
  ...props.theme.typography.body_l,
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

type Props = {
  unsignedTx: StacksTransactionWire;
  codeBody: string;
  contractName: string;
  sponsored: boolean;
  tabId: number;
  requestToken: string;
  messageId: string | null;
  rpcMethod: string | null;
  broadcastAfterSigning: boolean;
};

export default function ContractDeployRequest({
  unsignedTx,
  codeBody,
  contractName,
  sponsored,
  tabId,
  requestToken,
  messageId,
  rpcMethod,
  broadcastAfterSigning,
}: Props) {
  const selectedNetwork = useNetworkSelector();
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const { t } = useTranslation('translation');
  const [loaderForBroadcastingTx, setLoaderForBroadcastingTx] = useState(false);
  const [fee, setFee] = useState<BigNumber | undefined>(undefined);
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

  const broadcastTx = async (tx: StacksTransactionWire[]) => {
    const txId = tx[0].txid();
    try {
      if (broadcastAfterSigning) {
        setLoaderForBroadcastingTx(true);
        await broadcastSignedTransaction(tx[0], selectedNetwork);
      }
      if (rpcMethod && messageId && tabId) {
        switch (rpcMethod) {
          case 'stx_signTransaction': {
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: tx[0].serialize() },
            });
            break;
          }
          case 'stx_deployContract': {
            sendDeployContractSuccessResponseMessage({
              tabId,
              messageId,
              result: { txid: txId, transaction: tx[0].serialize() },
            });
            break;
          }
          default:
            sendInternalErrorMessage({ tabId, messageId });
            break;
        }
        if (!broadcastAfterSigning) window.close();
      } else {
        finalizeTxSignature({
          requestPayload: requestToken,
          tabId,
          data: { txId, txRaw: tx[0].serialize() },
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

  const confirmCallback = (txs: StacksTransactionWire[]) => {
    if (sponsored) {
      if (rpcMethod && messageId && tabId) {
        switch (rpcMethod) {
          case 'stx_signTransaction':
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: unsignedTx.serialize() },
            });
            break;
          default:
            sendInternalErrorMessage({ tabId, messageId });
            break;
        }
        sendSignTransactionSuccessResponseMessage({
          tabId,
          messageId,
          result: { transaction: unsignedTx.serialize() },
        });
      }
      if (requestToken) {
        finalizeTxSignature({
          requestPayload: requestToken,
          tabId,
          data: { txId: '', txRaw: unsignedTx.serialize() },
        });
      }
      window.close();
    } else if (isMultiSigTx) {
      if (rpcMethod && messageId && tabId) {
        switch (rpcMethod) {
          case 'stx_signTransaction':
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: unsignedTx.serialize() },
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
          data: { txId: '', txRaw: unsignedTx.serialize() },
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

  const postConditionAlert = unsignedTx?.postConditionMode === PostConditionMode.Deny &&
    unsignedTx?.postConditions.values.length <= 0 && (
      <PostConditionContainer>
        <PostConditionAlertText>
          {t('DEPLOY_CONTRACT_REQUEST.POST_CONDITION_ALERT')}
        </PostConditionAlertText>
      </PostConditionContainer>
    );

  const PostConditions = useCallback(() => {
    const { postConds: postConditions } = extractFromPayload(unsignedTx.payload);
    return (
      <>
        {postConditions.map((postCondition) => (
          <StxPostConditionCard key={postCondition.type} postCondition={postCondition} />
        ))}
      </>
    );
  }, [unsignedTx]);

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
        fee={fee ? microstacksToStx(fee).toString() : undefined}
        setFeeRate={(feeRate: string) => {
          setFee(stxToMicrostacks(new BigNumber(feeRate)));
        }}
      >
        {hasTabClosed && (
          <InfoContainer
            titleText={t('WINDOW_CLOSED_ALERT.TITLE')}
            bodyText={t('WINDOW_CLOSED_ALERT.BODY')}
          />
        )}
        {postConditionAlert}
        <PostConditions />
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
        {sponsored && (
          <TransactionDetailComponent
            title={t('DEPLOY_CONTRACT_REQUEST.SPONSORED')}
            value={t('DEPLOY_CONTRACT_REQUEST.SPONSORED_VALUE_YES')}
          />
        )}
      </ConfirmStxTransactionComponent>
    </>
  );
}
