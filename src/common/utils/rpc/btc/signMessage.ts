import { WebBtcMessage } from '@common/types/message-types';
import { RpcErrorCode } from 'sats-connect';
import { z } from 'zod';
import {
  OtherParams,
  listenForOriginTabClose,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../legacy-external-message-handler';
import RequestsRoutes from '../../route-urls';
import { makeRPCError } from '../helpers';

const SignMessageSchema = z.object({
  address: z.string(),
  message: z.string(),
});

export const handleSignMessage = async (
  message: WebBtcMessage<'signMessage'>,
  port: chrome.runtime.Port,
) => {
  const safeParseResult = SignMessageSchema.safeParse(message.params);
  if (!safeParseResult.success) {
    const invalidParamsError = makeRPCError(message.id, {
      code: RpcErrorCode.INVALID_PARAMS,
      message: 'Invalid params',
    });
    port.postMessage(invalidParamsError);
    return;
  }

  const requestParams: OtherParams = [
    ['address', safeParseResult.data.address],
    ['message', safeParseResult.data.message],
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
