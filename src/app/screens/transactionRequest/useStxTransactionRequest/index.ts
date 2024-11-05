import { parseData } from '@common/utils';
import { getPopupPayload, type Context } from '@common/utils/popup';
import { callContractParamsSchema } from '@common/utils/rpc/stx/callContract/paramsSchema';
import { deployContractParamsSchema } from '@common/utils/rpc/stx/deployContract/paramsSchema';
import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { stxSignTransactionRequestMessageSchema } from '@sats-connect/core';
import { txPayloadToRequest } from '@secretkeylabs/xverse-core';
import {
  TransactionTypes,
  type ContractCallPayload,
  type ContractDeployPayload,
} from '@stacks/connect';
import { AuthType, PayloadType, deserializeTransaction } from '@stacks/transactions';
import { createUnsecuredToken, decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import * as v from 'valibot';
import type { Return } from './types';
import { getPayload, isDeployContractPayload } from './utils';

export type DataStxSignTransaction = {
  context: Context;
  data: {
    method: 'stx_signTransaction';
    params: {
      transaction: string;
      pubkey?: string;
      broadcast?: boolean;
    };
    id: string;
    jsonrpc: '2.0';
  };
} | null;

const useStxTransactionRequest = (
  dataStxSignTransactionOverride?: DataStxSignTransaction,
): Return => {
  // Params
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // Utils
  const { stxAddress, stxPublicKey } = useSelectedAccount();
  const network = useNetworkSelector();

  // Common to all WebBTC RPC methods
  const tabId = Number(params.get('tabId')) ?? 0;
  const messageId = params.get('messageId') ?? '';
  let rpcMethod = params.get('rpcMethod') ?? '';

  const [errorStxSignTransaction, payloadDataStxSignTransaction] = getPopupPayload((data) =>
    v.parse(stxSignTransactionRequestMessageSchema, data),
  );

  const dataStxSignTransaction = dataStxSignTransactionOverride ?? payloadDataStxSignTransaction;

  if (dataStxSignTransaction) {
    if (dataStxSignTransaction.data.method) {
      rpcMethod = dataStxSignTransaction.data.method;
    }
    const { transaction: transactionHex } = dataStxSignTransaction.data.params;
    const transaction = deserializeTransaction(transactionHex);

    let legacyPayload: any;
    const txPayload = transaction.payload;
    if (txPayload.payloadType === PayloadType.TokenTransfer) {
      legacyPayload = {
        txType: 'token_transfer',
        recipient: txPayload.recipient,
        amount: txPayload.amount,
        memo: txPayload.memo,
        sponsored: transaction.auth.authType === AuthType.Sponsored,
      };
    }
    if (txPayload.payloadType === PayloadType.ContractCall) {
      legacyPayload = txPayloadToRequest(transaction, stxAddress);
    }

    if (isDeployContractPayload(txPayload.payloadType)) {
      legacyPayload = {
        network,
        ...txPayloadToRequest(transaction, stxAddress),
      };
    }

    return {
      // Metadata
      tabId: dataStxSignTransaction.context.tabId,
      messageId: dataStxSignTransaction.data.id,
      rpcMethod: 'stx_signTransaction',
      broadcast: dataStxSignTransaction.data.params.broadcast ?? true,

      // Legacy
      payload: legacyPayload,
      transaction,
      requestToken: '',
    };
  }

  switch (rpcMethod) {
    case 'stx_transferStx': {
      const payload = {
        network,
        recipient: params.get('recipient'),
        amount: params.get('amount'),
        memo: params.get('memo'),
        txType: 'token_transfer',
      };
      return {
        // Metadata
        messageId,
        tabId,
        rpcMethod,
        broadcast: true,

        // Legacy
        payload,
        requestToken: '',
      };
    }
    case 'stx_signTransaction': {
      const transactionHex = params.get('transaction') ?? '';
      const transaction = deserializeTransaction(transactionHex);

      let legacyPayload: any;
      const txPayload = transaction.payload;
      if (txPayload.payloadType === PayloadType.TokenTransfer) {
        legacyPayload = {
          txType: 'token_transfer',
          recipient: txPayload.recipient,
          amount: txPayload.amount,
          memo: txPayload.memo,
          sponsored: transaction.auth.authType === AuthType.Sponsored,
        };
      }
      if (txPayload.payloadType === PayloadType.ContractCall) {
        legacyPayload = txPayloadToRequest(transaction, stxAddress);
      }

      if (isDeployContractPayload(txPayload.payloadType)) {
        legacyPayload = {
          network,
          ...txPayloadToRequest(transaction, stxAddress),
        };
      }

      return {
        // Metadata
        tabId,
        messageId,
        rpcMethod,
        broadcast: true,

        // Legacy
        payload: legacyPayload,
        transaction,
        requestToken: '',
      };
    }
    case 'stx_callContract': {
      const contract = params.get('contract') ?? '';
      const functionName = params.get('functionName') ?? '';
      const argumentsString = params.get('arguments') ?? '';
      const [error, data] = parseData(argumentsString, callContractParamsSchema.shape.arguments);

      const argumentsArray = error
        ? (() => {
            // eslint-disable-next-line no-console
            console.error('Error parsing arguments', error);
            return undefined;
          })()
        : data;

      const payload: ContractCallPayload = {
        txType: TransactionTypes.ContractCall,
        contractAddress: contract.split('.')[0],
        contractName: contract.split('.')[1],
        functionName,
        functionArgs: argumentsArray ?? [],
        publicKey: stxPublicKey,
        network,
        postConditions: [],
      };
      const requestToken = createUnsecuredToken(payload as any);

      return {
        // Metadata
        tabId,
        messageId,
        rpcMethod,
        broadcast: true,

        // Legacy
        payload,
        requestToken,
      };
    }
    case 'stx_deployContract': {
      const name = params.get('name') ?? '';
      const clarityCodeParam = params.get('clarityCode') ?? '';
      const [, clarityCode] = parseData(
        clarityCodeParam,
        deployContractParamsSchema.shape.clarityCode,
      );
      // Currently unused
      // const clarityVersion = params.get('clarityVersion') ?? '';

      const payload: ContractDeployPayload = {
        contractName: name,
        codeBody: clarityCode ?? '',
        txType: TransactionTypes.ContractDeploy,
        publicKey: stxPublicKey,
      };
      const requestToken = createUnsecuredToken(payload as any);

      return {
        // Metadata
        tabId,
        messageId,
        rpcMethod,
        broadcast: true,

        // Legacy
        payload,
        requestToken,
      };
    }
    default: {
      // Assume legacy request
      const requestToken = params.get('request') ?? '';
      const decodedToken = decodeToken(requestToken ?? '') as any;
      const transaction = decodedToken.payload.txHex
        ? deserializeTransaction(decodedToken.payload.txHex!)
        : undefined;
      const txPayload = getPayload({ decodedToken, transaction });

      return {
        broadcast: true,
        payload: txPayload,
        transaction,
        tabId,
        requestToken,
      };
    }
  }
};

export default useStxTransactionRequest;
