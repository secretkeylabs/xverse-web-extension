import { parseData } from '@common/utils';
import { callContractParamsSchema } from '@common/utils/rpc/stx/callContract/paramsSchema';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import { txPayloadToRequest } from '@secretkeylabs/xverse-core';
import { ContractCallPayload, TransactionTypes } from '@stacks/connect';
import { deserializeTransaction } from '@stacks/transactions';
import { createUnsecuredToken, decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import { Return } from './types';
import { getPayload } from './utils';

const useStxTransactionRequest = (): Return => {
  // Params
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // Utils
  const { stxAddress, stxPublicKey } = useWalletSelector();
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
      const payload = txPayloadToRequest(transaction, stxAddress);

      return {
        // Metadata
        tabId,
        messageId,
        rpcMethod,

        // Legacy
        payload,
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
