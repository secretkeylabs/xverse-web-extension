import { MESSAGE_SOURCE } from '@common/types/message-types';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '@common/utils/legacy-external-message-handler';
import RequestsRoutes from '@common/utils/route-urls';
import { RpcErrorCode, type StxTransferStxRequestMessage } from '@sats-connect/core';
import { makeRPCError } from '../../helpers';

async function transferStx(message: StxTransferStxRequestMessage, port: chrome.runtime.Port) {
  const requestParams = {
    amount: message.params.amount.toString(),
    recipient: message.params.recipient,
    memo: message.params.memo,
    rpcMethod: message.method,
    messageId: String(message.id),
  };

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, requestParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.TransactionRequest, urlParams);

  listenForPopupClose({
    tabId,
    id,
    response: {
      ...makeRPCError(message.id, {
        code: RpcErrorCode.USER_REJECTION,
        message: 'User rejected the Stacks transaction signing request',
      }),
      source: MESSAGE_SOURCE,
    },
  });
}

export default transferStx;
