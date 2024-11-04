import { RpcErrorCode, type StxGetAccountsRequestMessage } from '@sats-connect/core';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../../legacy-external-message-handler';
import RequestsRoutes from '../../../route-urls';
import { makeRPCError } from '../../helpers';

const handleGetStxAccounts = async (
  message: StxGetAccountsRequestMessage,
  port: chrome.runtime.Port,
) => {
  const popupParams = {
    messageId: String(message.id),
    rpcMethod: 'stx_getAccounts',
  };

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, popupParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.StxAccountRequest, urlParams);
  listenForPopupClose({
    tabId,
    id,
    response: makeRPCError(message.id, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'User rejected request to get accounts',
    }),
  });
};

export default handleGetStxAccounts;
