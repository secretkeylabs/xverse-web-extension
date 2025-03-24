import { MESSAGE_SOURCE } from '@common/types/message-types';
import { stringifyData } from '@common/utils';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '@common/utils/legacy-external-message-handler';
import RequestsRoutes from '@common/utils/route-urls';
import { RpcErrorCode, type StxDeployContractRequestMessage } from '@sats-connect/core';
import { makeRPCError } from '../../helpers';

async function deployContract(message: StxDeployContractRequestMessage, port: chrome.runtime.Port) {
  const popupParams = {
    // RPC params
    name: message.params.name,
    clarityCode: stringifyData(message.params.clarityCode),
    clarityVersion: message.params.clarityVersion,
    postConditions: message.params.postConditions
      ? stringifyData(message.params.postConditions)
      : undefined,
    postConditionMode: message.params.postConditionMode,

    // Metadata
    rpcMethod: 'stx_deployContract',
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
export default deployContract;
