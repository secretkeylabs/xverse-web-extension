import { MESSAGE_SOURCE } from '@common/types/message-types';
import { stringifyData } from '@common/utils';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '@common/utils/legacy-external-message-handler';
import RequestsRoutes from '@common/utils/route-urls';
import { RpcErrorCode, type StxCallContractRequestMessage } from '@sats-connect/core';
import { makeRPCError } from '../../helpers';

async function callContract(message: StxCallContractRequestMessage, port: chrome.runtime.Port) {
  const popupParams = {
    // RPC params
    contract: message.params.contract,
    functionName: message.params.functionName,
    /**
     * Support both arguments and functionArgs for @stacks/connect compatibility
     */
    arguments: message.params.arguments
      ? stringifyData(message.params.arguments)
      : message.params.functionArgs
      ? stringifyData(message.params.functionArgs)
      : undefined,
    postConditions: message.params.postConditions
      ? stringifyData(message.params.postConditions)
      : undefined,
    postConditionMode: message.params.postConditionMode,

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
