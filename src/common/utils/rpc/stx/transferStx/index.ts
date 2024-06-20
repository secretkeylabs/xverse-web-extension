import { MESSAGE_SOURCE, WebBtcMessage } from '@common/types/message-types';
import { getTabIdFromPort, isUndefined } from '@common/utils';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '@common/utils/legacy-external-message-handler';
import RequestsRoutes from '@common/utils/route-urls';
import { RpcErrorCode } from '@sats-connect/core';
import { makeRPCError } from '../../helpers';
import {
  sendInvalidParametersResponseMessage,
  sendMissingParametersMessage,
} from '../../rpcResponseMessages';
import paramsSchema from './paramsSchema';

async function transferStx(message: WebBtcMessage<'stx_transferStx'>, port: chrome.runtime.Port) {
  if (isUndefined(message.params)) {
    sendMissingParametersMessage({ tabId: getTabIdFromPort(port), messageId: message.id });
    return;
  }

  const paramsParseResult = paramsSchema.safeParse(message.params);
  if (!paramsParseResult.success) {
    sendInvalidParametersResponseMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      error: paramsParseResult.error,
    });
    return;
  }

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
