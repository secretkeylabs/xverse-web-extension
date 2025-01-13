import {
  sendInternalErrorMessage,
  sendUserRejectionMessage,
} from '@common/utils/rpc/responseMessages/errors';
import {
  sendCallContractSuccessResponseMessage,
  sendSignTransactionSuccessResponseMessage,
} from '@common/utils/rpc/responseMessages/stacks';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmStxTransactionComponent from '@components/confirmStxTransactionComponent';
import FtPostConditionCard from '@components/postCondition/ftPostConditionCard';
import NftPostConditionCard from '@components/postCondition/nftPostConditionCard';
import StxPostConditionCard from '@components/postCondition/stxPostConditionCard';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useNetworkSelector from '@hooks/useNetwork';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import useExecuteOrder from '@screens/swap/components/psbtConfirmation/useExecuteOrder';
import {
  broadcastSignedTransaction,
  extractFromPayload,
  isMultiSig,
  microstacksToStx,
  StacksMainnet,
  stxToMicrostacks,
  type Coin,
  type ContractFunction,
  type ExecuteStxOrderRequest,
} from '@secretkeylabs/xverse-core';
import type { ContractCallPayload } from '@stacks/connect';
import {
  addressToString,
  PostConditionMode,
  PostConditionType,
  type MultiSigSpendingCondition,
  type StacksTransactionWire,
} from '@stacks/transactions';
import Callout from '@ui-library/callout';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ContractDetails from './contractCallDetails';
import finalizeTxSignature from './utils';

const PostConditionContainer = styled.div((props) => ({
  display: 'flex',
  paddingTop: props.theme.space.l,
  paddingBottom: props.theme.space.l,
  marginBottom: props.theme.space.l,
  borderTop: `0.5px solid ${props.theme.colors.elevation3}`,
  borderBottom: `0.5px solid ${props.theme.colors.elevation3}`,
  flexDirection: 'column',
}));

const PostConditionAlertText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_l,
  color: props.theme.colors.white_0,
}));

type Props = {
  request: ContractCallPayload;
  unsignedTx: StacksTransactionWire;
  funcMetaData: ContractFunction | undefined;
  coinsMetaData: Coin[] | null;
  tabId: number;
  messageId: string | null;
  rpcMethod: string | null;
  requestToken: string;
  attachment: Buffer | undefined;
  broadcastAfterSigning: boolean;
  onSignTransaction?: () => void;
};

export default function ContractCallRequest({
  request,
  unsignedTx,
  funcMetaData,
  coinsMetaData,
  tabId,
  requestToken,
  attachment,
  messageId,
  rpcMethod,
  broadcastAfterSigning,
  onSignTransaction,
}: Props) {
  const selectedNetwork = useNetworkSelector();
  const navigate = useNavigate();
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const { t } = useTranslation('translation');
  const [fee, setFee] = useState<BigNumber | undefined>(
    new BigNumber(unsignedTx.auth.spendingCondition.fee.toString()),
  );
  const { executeStxOrder } = useExecuteOrder();
  const [isLoading, setIsLoading] = useState(false);
  // TODO fix this to be less hacky
  const isStxSwap = messageId === 'velar' || messageId === 'alex' || messageId === 'bitflow';

  // SignTransaction Params
  const isMultiSigTx = isMultiSig(unsignedTx);
  const hasSignatures =
    isMultiSigTx &&
    (unsignedTx.auth.spendingCondition as MultiSigSpendingCondition).fields?.length > 0;

  useOnOriginTabClose(tabId, () => {
    setHasTabClosed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const postConditionAlert = unsignedTx?.postConditionMode === PostConditionMode.Deny &&
    unsignedTx?.postConditions.values.length <= 0 && (
      <PostConditionContainer>
        <PostConditionAlertText>
          {t('CONTRACT_CALL_REQUEST.POST_CONDITION_ALERT')}
        </PostConditionAlertText>
      </PostConditionContainer>
    );

  const broadcastTx = async (
    tx: StacksTransactionWire[],
    txAttachment: Buffer | undefined = undefined,
  ) => {
    const txId = tx[0].txid();
    try {
      if (broadcastAfterSigning) {
        await broadcastSignedTransaction(tx[0], selectedNetwork, txAttachment);
      }
      if (tabId && messageId && rpcMethod) {
        switch (rpcMethod) {
          case 'stx_signTransaction': {
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: Buffer.from(tx[0].serialize()).toString('hex') },
            });
            break;
          }
          case 'stx_callContract': {
            sendCallContractSuccessResponseMessage({
              tabId,
              messageId,
              result: {
                transaction: Buffer.from(tx[0].serialize()).toString('hex'),
                txid: txId,
              },
            });
            break;
          }
          default: {
            sendInternalErrorMessage({ tabId, messageId });
          }
        }
        if (!broadcastAfterSigning) window.close();
      } else {
        finalizeTxSignature({
          requestPayload: requestToken,
          tabId,
          data: { txId, txRaw: Buffer.from(tx[0].serialize()).toString('hex') },
        });
      }
      navigate('/tx-status', {
        state: {
          txid: txId,
          currency: 'STX',
          error: '',
          browserTx: true,
          tabId,
          messageId,
          rpcMethod,
        },
      });
    } catch (e) {
      sendInternalErrorMessage({ tabId, messageId });
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: e instanceof Error ? e.message : 'An error occurred',
          browserTx: true,
          tabId,
          messageId,
          rpcMethod,
        },
      });
    }
  };

  const confirmCallback = async (transactions: StacksTransactionWire[]) => {
    if (isStxSwap) {
      const order: ExecuteStxOrderRequest = {
        providerCode: messageId,
        signedTransaction: Buffer.from(transactions[0].serialize()).toString('hex'),
      };
      setIsLoading(true);
      const response = await executeStxOrder(order);
      setIsLoading(false);

      if (response) {
        if (onSignTransaction) onSignTransaction();
        navigate('/tx-status', {
          state: {
            txid: response.txid,
            currency: 'STX',
            error: '',
            browserTx: true,
            tabId,
            messageId,
            rpcMethod,
          },
        });
      }
      return;
    }

    if (request?.sponsored) {
      if (rpcMethod && tabId && messageId) {
        switch (rpcMethod) {
          case 'stx_signTransaction': {
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: Buffer.from(unsignedTx.serialize()).toString('hex') },
            });
            break;
          }
          default: {
            sendInternalErrorMessage({ tabId, messageId });
          }
        }
      }
      if (requestToken) {
        finalizeTxSignature({
          requestPayload: requestToken,
          tabId,
          data: { txId: '', txRaw: Buffer.from(unsignedTx.serialize()).toString('hex') },
        });
      }
      window.close();
    } else if (isMultiSigTx) {
      if (rpcMethod && tabId && messageId) {
        switch (rpcMethod) {
          case 'stx_signTransaction': {
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: Buffer.from(unsignedTx.serialize()).toString('hex') },
            });
            break;
          }
          default: {
            sendInternalErrorMessage({ tabId, messageId });
          }
        }
      } else {
        finalizeTxSignature({
          requestPayload: requestToken,
          tabId,
          data: { txId: '', txRaw: Buffer.from(unsignedTx.serialize()).toString('hex') },
        });
      }
      window.close();
    } else {
      broadcastTx(transactions, attachment);
    }
  };
  const cancelCallback = () => {
    if (isStxSwap) {
      return navigate(-1);
    }
    if (tabId && messageId) {
      sendUserRejectionMessage({ tabId, messageId });
    } else {
      finalizeTxSignature({ requestPayload: requestToken, tabId, data: 'cancel' });
    }
    window.close();
  };

  const renderPostConditionsCard = () => {
    const { postConds: postConditions } = extractFromPayload(request);
    return postConditions?.map((postCondition, i) => {
      const key = `${postCondition.conditionType}-${i}`;

      switch (postCondition.conditionType) {
        case PostConditionType.STX:
          return <StxPostConditionCard key={key} postCondition={postCondition} />;
        case PostConditionType.Fungible: {
          const coinInfo = coinsMetaData?.find(
            (coin: Coin) =>
              coin.contract ===
              `${addressToString(postCondition.asset.address)}.${
                postCondition.asset.contractName.content
              }`,
          );
          return (
            <FtPostConditionCard key={key} postCondition={postCondition} ftMetaData={coinInfo} />
          );
        }
        case PostConditionType.NonFungible:
          return <NftPostConditionCard key={key} postCondition={postCondition} />;
        default:
          return '';
      }
    });
  };

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <ConfirmStxTransactionComponent
        initialStxTransactions={[unsignedTx]}
        onConfirmClick={confirmCallback}
        onCancelClick={cancelCallback}
        loading={isLoading}
        isSponsored={request.sponsored}
        subTitle={request.appDetails?.name ? `Requested by ${request.appDetails.name}` : undefined}
        hasSignatures={hasSignatures}
        fee={fee ? microstacksToStx(fee).toString() : undefined}
        setFeeRate={(feeRate: string) => {
          setFee(stxToMicrostacks(new BigNumber(feeRate)));
        }}
      >
        {hasTabClosed && (
          <Callout
            titleText={t('WINDOW_CLOSED_ALERT.TITLE')}
            bodyText={t('WINDOW_CLOSED_ALERT.BODY')}
          />
        )}
        {postConditionAlert}
        {renderPostConditionsCard()}
        {funcMetaData && <ContractDetails contractCall={request} functionMetadata={funcMetaData} />}
        <TransactionDetailComponent
          title={t('CONTRACT_CALL_REQUEST.REQUEST_NETWORK')}
          value={
            selectedNetwork.chainId === StacksMainnet.chainId
              ? t('CONTRACT_CALL_REQUEST.REQUEST_NETWORK_MAINNET')
              : t('CONTRACT_CALL_REQUEST.REQUEST_NETWORK_TESTNET')
          }
        />
        {request.sponsored && (
          <TransactionDetailComponent
            title={t('CONTRACT_CALL_REQUEST.SPONSORED')}
            value={t('CONTRACT_CALL_REQUEST.SPONSORED_VALUE_YES')}
          />
        )}
      </ConfirmStxTransactionComponent>
    </>
  );
}
