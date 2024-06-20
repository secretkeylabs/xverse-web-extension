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
} from '../../rpcResponseMessages';
import { deployContractParamsSchema } from './paramsSchema';

async function deployContract(
  message: WebBtcMessage<'stx_deployContract'>,
  port: chrome.runtime.Port,
) {
  if (isUndefined(message.params)) {
    sendMissingParametersMessage({ tabId: getTabIdFromPort(port), messageId: message.id });
    return;
  }

  const paramsParseResult = deployContractParamsSchema.safeParse(message.params);
  if (!paramsParseResult.success) {
    sendInvalidParametersResponseMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      error: paramsParseResult.error,
    });
    return;
  }

  const popupParams = {
    // RPC params
    name: paramsParseResult.data.name,
    clarityCode: stringifyData(paramsParseResult.data.clarityCode),
    clarityVersion: paramsParseResult.data.clarityVersion,

    // Metadata
    rpcMethod: 'stx_deployContract',
    messageId: message.id,
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

export default deployContract;
