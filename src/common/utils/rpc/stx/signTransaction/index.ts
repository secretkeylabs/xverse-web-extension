import { MESSAGE_SOURCE, WebBtcMessage } from '@common/types/message-types';
import { getTabIdFromPort, isUndefined } from '@common/utils';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '@common/utils/legacy-external-message-handler';
import RequestsRoutes from '@common/utils/route-urls';
import { RpcErrorCode } from 'sats-connect';
import { makeRPCError } from '../../helpers';
import {
  sendInvalidParametersMessage,
  sendInvalidStacksTransactionMessage,
  sendMissingParametersMessage,
} from '../rpcResponseMessages';
import paramsSchema from './paramsSchema';
import { isValidStacksTransaction } from './utils';

async function signTransaction(
  message: WebBtcMessage<'stx_signTransaction'>,
  port: chrome.runtime.Port,
) {
  if (isUndefined(message.params)) {
    sendMissingParametersMessage({ tabId: getTabIdFromPort(port), messageId: message.id });
    return;
  }

  const paramsParseResult = paramsSchema.safeParse(message.params);
  if (!paramsParseResult.success) {
    sendInvalidParametersMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      error: paramsParseResult.error,
    });
    return;
  }

  if (!isValidStacksTransaction(message.params.transaction)) {
    sendInvalidStacksTransactionMessage({ tabId: getTabIdFromPort(port), messageId: message.id });
    return;
  }

  const popupParams = {
    transaction: message.params.transaction,
    messageId: String(message.id),
    rpcMethod: message.method,
  };

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, popupParams);

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

export default signTransaction;
