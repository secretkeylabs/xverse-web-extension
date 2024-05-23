import { MESSAGE_SOURCE, WebBtcMessage } from '@common/types/message-types';
import { getTabIdFromPort, isUndefined } from '@common/utils';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '@common/utils/legacy-external-message-handler';
import RequestsRoutes from '@common/utils/route-urls';
import { RpcErrorCode } from '@sats-connect/core';
import { z } from 'zod';
import { makeRPCError } from '../../helpers';
import { sendInvalidParametersMessage, sendMissingParametersMessage } from '../rpcResponseMessages';

export const rpcParamsSchema = z.object({
  message: z.string(),
  domain: z.string(),
});

export type Params = z.infer<typeof rpcParamsSchema>;

async function handleStacksSignStructuredMessage(
  message: WebBtcMessage<'stx_signStructuredMessage'>,
  port: chrome.runtime.Port,
) {
  if (isUndefined(message.params)) {
    sendMissingParametersMessage({ tabId: getTabIdFromPort(port), messageId: message.id });
    return;
  }

  const paramsParseResult = rpcParamsSchema.safeParse(message.params);
  if (!paramsParseResult.success) {
    sendInvalidParametersMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      error: paramsParseResult.error,
    });
    return;
  }

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
