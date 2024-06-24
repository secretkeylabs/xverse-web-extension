import { parseData } from '@common/utils';
import { callContractParamsSchema } from '@common/utils/rpc/stx/callContract/paramsSchema';
import { deployContractParamsSchema } from '@common/utils/rpc/stx/deployContract/paramsSchema';
import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { txPayloadToRequest } from '@secretkeylabs/xverse-core';
import { ContractCallPayload, ContractDeployPayload, TransactionTypes } from '@stacks/connect';
import { AuthType, PayloadType, deserializeTransaction } from '@stacks/transactions';
import { createUnsecuredToken, decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import { Return } from './types';
import { getPayload, isDeployContractPayload } from './utils';

const useStxTransactionRequest = (): Return => {
  // Params
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // Utils
  const { stxAddress, stxPublicKey } = useSelectedAccount();
  const network = useNetworkSelector();

  // Common to all WebBTC RPC methods
  const tabId = Number(params.get('tabId')) ?? 0;
  const messageId = params.get('messageId') ?? '';
  const rpcMethod = params.get('rpcMethod') ?? '';

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
        payload: txPayload,
        transaction,
        tabId,
        requestToken,
      };
    }
  }
};

export default useStxTransactionRequest;
