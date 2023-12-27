import { txPayloadToRequest } from '@secretkeylabs/xverse-core';
import { deserializeTransaction } from '@stacks/transactions';
import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';

const useStxTransactionRequest = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('request') ?? '';
  const request = decodeToken(requestToken) as any;
  const tabId = params.get('tabId') ?? '0';
  const stacksTransaction = request.payload.txHex
    ? deserializeTransaction(request.payload.txHex!)
    : undefined;

  const getPayload = () => {
    if (stacksTransaction) {
      const txPayload = txPayloadToRequest(
        stacksTransaction,
        request.payload.stxAddress,
        request.payload.attachment,
      );
      return {
        ...request.payload,
        ...txPayload,
      };
    }
    return request.payload;
  };

  const txPayload = getPayload();

  return {
    payload: txPayload,
    stacksTransaction,
    tabId,
    requestToken,
  };
};

export default useStxTransactionRequest;
