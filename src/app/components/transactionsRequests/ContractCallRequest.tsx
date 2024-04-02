import {
  sendCallContractSuccessResponseMessage,
  sendInternalErrorMessage,
  sendSignTransactionSuccessResponseMessage,
  sendUserRejectionMessage,
} from '@common/utils/rpc/stx/rpcResponseMessages';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmStxTransactionComponent from '@components/confirmStxTransactionComponent';
import InfoContainer from '@components/infoContainer';
import FtPostConditionCard from '@components/postCondition/ftPostConditionCard';
import NftPostConditionCard from '@components/postCondition/nftPostConditionCard';
import StxPostConditionCard from '@components/postCondition/stxPostConditionCard';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useNetworkSelector from '@hooks/useNetwork';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import {
  Args,
  Coin,
  ContractFunction,
  addressToString,
  broadcastSignedTransaction,
  buf2hex,
  extractFromPayload,
  isMultiSig,
} from '@secretkeylabs/xverse-core';
import { ContractCallPayload } from '@stacks/connect';
import {
  ClarityType,
  MultiSigSpendingCondition,
  PostConditionType,
  SomeCV,
  StacksTransaction,
  cvToJSON,
  cvToString,
} from '@stacks/transactions';
import { createContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import finalizeTxSignature from './utils';

const PostConditionContainer = styled.div((props) => ({
  display: 'flex',
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  marginBottom: props.theme.spacing(12),
  borderTop: `0.5px solid ${props.theme.colors.elevation3}`,
  borderBottom: `0.5px solid ${props.theme.colors.elevation3}`,
  flexDirection: 'column',
}));

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
  ...props.theme.body_medium_l,
  color: props.theme.colors.white_0,
}));

interface ContractCallRequestProps {
  request: ContractCallPayload;
  unsignedTx: StacksTransaction;
  funcMetaData: ContractFunction | undefined;
  coinsMetaData: Coin[] | null;
  tabId: number;
  messageId: string | null;
  rpcMethod: string | null;
  requestToken: string;
  attachment: Buffer | undefined;
}

export const ShowMoreContext = createContext({ showMore: false });

export default function ContractCallRequest(props: ContractCallRequestProps) {
  const {
    request,
    unsignedTx,
    funcMetaData,
    coinsMetaData,
    tabId,
    requestToken,
    attachment,
    messageId,
    rpcMethod,
  } = props;
  const selectedNetwork = useNetworkSelector();
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const { t } = useTranslation('translation');

  // SignTransaction Params
  const isMultiSigTx = isMultiSig(unsignedTx);
  const hasSignatures =
    isMultiSigTx &&
    (unsignedTx.auth.spendingCondition as MultiSigSpendingCondition).fields?.length > 0;

  useOnOriginTabClose(tabId, () => {
    setHasTabClosed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  type ArgToView = { name: string; value: string; type: any };
  const getFunctionArgs = (): Array<ArgToView> => {
    const { funcArgs } = extractFromPayload(request);
    const args: Array<ArgToView> = funcMetaData?.args
      ? funcMetaData?.args?.map((arg: Args, index: number) => {
          const funcArg = cvToJSON(funcArgs[index]);

          const argTypeIsOptionalSome = funcArgs[index].type === ClarityType.OptionalSome;

          const funcArgType = argTypeIsOptionalSome
            ? (funcArgs[index] as SomeCV).value?.type
            : funcArgs[index]?.type;

          const funcArgValString = argTypeIsOptionalSome
            ? cvToString((funcArgs[index] as SomeCV).value, 'tryAscii')
            : cvToString(funcArgs[index]);

          const normalizedValue = (() => {
            switch (funcArgType) {
              case ClarityType.UInt:
                return funcArgValString.split('u').join('');
              case ClarityType.Buffer:
                return funcArgValString.substring(1, funcArgValString.length - 1);
              default:
                return funcArgValString;
            }
          })();
          const argToView: ArgToView = {
            name: arg.name,
            value: normalizedValue,
            type: funcArg.type,
          };

          return argToView;
        })
      : [];
    return args;
  };

  const truncateFunctionArgsView = (value: string) =>
    `${value.substring(0, 12)}...${value.substring(value.length - 12, value.length)}`;

  const functionArgsView = () => {
    const args = getFunctionArgs();
    return args.map((arg) => (
      <TransactionDetailComponent
        key={arg.name}
        title={arg.name}
        value={arg.value.length > 20 ? truncateFunctionArgsView(arg.value) : arg.value}
        description={arg.type}
      />
    ));
  };

  const showSponsoredTransactionTag = (
    <SponsoredContainer>
      <SponsoredTag>
        <SponosredText>{t('CONTRACT_CALL_REQUEST.SPONSORED')}</SponosredText>
      </SponsoredTag>
    </SponsoredContainer>
  );

  const postConditionAlert = unsignedTx?.postConditionMode === 2 &&
    unsignedTx?.postConditions.values.length <= 0 && (
      <PostConditionContainer>
        <PostConditionAlertText>
          {t('CONTRACT_CALL_REQUEST.POST_CONDITION_ALERT')}
        </PostConditionAlertText>
      </PostConditionContainer>
    );
  const navigate = useNavigate();
  const broadcastTx = async (
    tx: StacksTransaction[],
    txAttachment: Buffer | undefined = undefined,
  ) => {
    try {
      const txId = await broadcastSignedTransaction(tx[0], selectedNetwork, txAttachment);
      if (tabId && messageId && rpcMethod) {
        switch (rpcMethod) {
          case 'stx_signTransaction': {
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: buf2hex(tx[0].serialize()) },
            });
            break;
          }
          case 'stx_callContract': {
            sendCallContractSuccessResponseMessage({
              tabId,
              messageId,
              result: {
                transaction: buf2hex(tx[0].serialize()),
                txid: txId,
              },
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

  const confirmCallback = (transactions: StacksTransaction[]) => {
    if (request?.sponsored) {
      if (rpcMethod && tabId && messageId) {
        switch (rpcMethod) {
          case 'stx_signTransaction': {
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: buf2hex(unsignedTx.serialize()) },
            });
            break;
          }
          default: {
            sendInternalErrorMessage({ tabId, messageId });
          }
        }
      }
      navigate('/tx-status', {
        state: {
          sponsored: true,
          browserTx: true,
        },
      });
    } else if (isMultiSigTx) {
      if (rpcMethod && tabId && messageId) {
        switch (rpcMethod) {
          case 'stx_signTransaction': {
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: buf2hex(unsignedTx.serialize()) },
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
          data: { txId: '', txRaw: buf2hex(unsignedTx.serialize()) },
        });
      }
      window.close();
    } else {
      broadcastTx(transactions, attachment);
    }
  };
  const cancelCallback = () => {
    if (tabId && messageId) {
      sendUserRejectionMessage({ tabId, messageId });
    } else {
      finalizeTxSignature({ requestPayload: requestToken, tabId, data: 'cancel' });
    }
    window.close();
  };

  const renderPostConditionsCard = () => {
    const { postConds } = extractFromPayload(request);
    return postConds?.map((postCondition, i) => {
      const key = `${postCondition.conditionType}-${i}`;

      switch (postCondition.conditionType) {
        case PostConditionType.STX:
          return <StxPostConditionCard key={key} postCondition={postCondition} />;
        case PostConditionType.Fungible: {
          const coinInfo = coinsMetaData?.find(
            (coin: Coin) =>
              coin.contract ===
              `${addressToString(postCondition.assetInfo.address)}.${
                postCondition.assetInfo.contractName.content
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
        loading={false}
        title={request.functionName}
        subTitle={`Requested by ${request.appDetails?.name}`}
        hasSignatures={hasSignatures}
      >
        <>
          {hasTabClosed && (
            <InfoContainer
              titleText={t('WINDOW_CLOSED_ALERT.TITLE')}
              bodyText={t('WINDOW_CLOSED_ALERT.BODY')}
            />
          )}
          {postConditionAlert}
          {request.sponsored && showSponsoredTransactionTag}
          {renderPostConditionsCard()}
          <TransactionDetailComponent
            title={t('CONTRACT_CALL_REQUEST.FUNCTION')}
            value={request?.functionName}
          />
          {functionArgsView()}
        </>
      </ConfirmStxTransactionComponent>
    </>
  );
}
