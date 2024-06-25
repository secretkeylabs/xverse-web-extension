import { MESSAGE_SOURCE, WebBtcMessage } from '@common/types/message-types';
import { getTabIdFromPort, isUndefined, stringifyData } from '@common/utils';
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
import { callContractParamsSchema } from './paramsSchema';

async function callContract(message: WebBtcMessage<'stx_callContract'>, port: chrome.runtime.Port) {
  if (isUndefined(message.params)) {
    sendMissingParametersMessage({ tabId: getTabIdFromPort(port), messageId: message.id });
    return;
  }

  const paramsParseResult = callContractParamsSchema.safeParse(message.params);
  if (!paramsParseResult.success) {
    sendInvalidParametersResponseMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      error: paramsParseResult.error,
    });
    return;
  }

  // TODO: Checks,
  //
  // 1. The contract name is valid
  // 2. The params are valid Clarity values
  //
  // Assuming that the checks performed by the schema for the function name are
  // good enough for now.

  const popupParams = {
    // RPC params
    contract: paramsParseResult.data.contract,
    functionName: paramsParseResult.data.functionName,
    arguments: stringifyData(paramsParseResult.data.arguments),

    // Metadata
    rpcMethod: 'stx_callContract',
    messageId: String(message.id),
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

export default callContract;
