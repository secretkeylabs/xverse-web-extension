import { MESSAGE_SOURCE } from '@common/types/message-types';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '@common/utils/legacy-external-message-handler';
import RequestsRoutes from '@common/utils/route-urls';
import { RpcErrorCode, type StxSignStructuredMessageRequestMessage } from '@sats-connect/core';
import { makeRPCError } from '../../helpers';

async function handleStacksSignStructuredMessage(
  message: StxSignStructuredMessageRequestMessage,
  port: chrome.runtime.Port,
) {
  const requestParams = {
    message: message.params.message,
    domain: message.params.domain,
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
        message: 'User rejected the structured message signing request',
      }),
      source: MESSAGE_SOURCE,
    },
  });
}

export default handleStacksSignStructuredMessage;
