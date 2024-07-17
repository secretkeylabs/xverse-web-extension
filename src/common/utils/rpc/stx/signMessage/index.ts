import { MESSAGE_SOURCE, type WebBtcMessage } from '@common/types/message-types';
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
} from '../../responseMessages/errors';
import { rpcParamsSchema } from './paramsSchema';

async function handleStacksSignMessage(
  message: WebBtcMessage<'stx_signMessage'>,
  port: chrome.runtime.Port,
) {
  if (isUndefined(message.params)) {
    sendMissingParametersMessage({ tabId: getTabIdFromPort(port), messageId: message.id });
    return;
  }

  const paramsParseResult = rpcParamsSchema.safeParse(message.params);
  if (!paramsParseResult.success) {
    sendInvalidParametersResponseMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      error: paramsParseResult.error,
    });
    return;
  }

  const requestParams = {
    message: message.params.message,
    messageId: String(message.id),
    rpcMethod: message.method,
  };

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, requestParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.SignatureRequest, urlParams);

  listenForPopupClose({
    tabId,
    id,
    response: {
      ...makeRPCError(message.id, {
        code: RpcErrorCode.USER_REJECTION,
        message: 'User rejected the message signing request',
      }),
      source: MESSAGE_SOURCE,
    },
  });
}

export default handleStacksSignMessage;
