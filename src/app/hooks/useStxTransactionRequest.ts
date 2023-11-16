import { txPayloadToRequest } from '@secretkeylabs/xverse-core/connect';
import { deserializeTransaction } from '@stacks/transactions';
import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';

const useStxTransactionRequest = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('request') ?? '';
  const request = decodeToken(requestToken) as any;
  const tabId = params.get('tabId') ?? '0';

  const getPayload = () => {
    const isSignHex = Boolean(request.payload.txHex);
    if (isSignHex) {
      const stacksTransaction = deserializeTransaction(request.payload.txHex!);
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
    tabId,
    requestToken,
  };
};

export default useStxTransactionRequest;
