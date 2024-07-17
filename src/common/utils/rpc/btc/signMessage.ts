import { WebBtcMessage } from '@common/types/message-types';
import { RpcErrorCode, signMessageRequestMessageSchema } from '@sats-connect/core';
import SuperJSON from 'superjson';
import * as v from 'valibot';
import {
  ParamsKeyValueArray,
  listenForOriginTabClose,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../legacy-external-message-handler';
import RequestsRoutes from '../../route-urls';
import { makeRPCError } from '../helpers';

export const handleSignMessage = async (
  message: WebBtcMessage<'signMessage'>,
  port: chrome.runtime.Port,
) => {
  const safeParseResult = v.safeParse(signMessageRequestMessageSchema, message);

  if (!safeParseResult.success) {
    const invalidParamsError = makeRPCError(message.id, {
      code: RpcErrorCode.INVALID_PARAMS,
      message: 'Invalid params',
    });
    port.postMessage(invalidParamsError);
    return;
  }

  const requestPayload = SuperJSON.stringify(safeParseResult.output.params);

  const requestParams: ParamsKeyValueArray = [
    ['payload', requestPayload],
    ['requestId', message.id as string],
  ];

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, requestParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.SignMessageRequest, urlParams);
  listenForPopupClose({
    tabId,
    id,
    response: makeRPCError(message.id, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'User rejected request to sign Message',
    }),
  });
  listenForOriginTabClose({ tabId });
};

export default handleSignMessage;
