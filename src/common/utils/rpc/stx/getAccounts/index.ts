import { WebBtcMessage } from '@common/types/message-types';
import { getTabIdFromPort, isUndefined } from '@common/utils';
import { RpcErrorCode } from '@sats-connect/core';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../../legacy-external-message-handler';
import RequestsRoutes from '../../../route-urls';
import { makeRPCError } from '../../helpers';
import { sendMissingParametersMessage } from '../../rpcResponseMessages';

const handleGetStxAccounts = async (
  message: WebBtcMessage<'stx_getAccounts'>,
  port: chrome.runtime.Port,
) => {
  if (isUndefined(message.params)) {
    sendMissingParametersMessage({ tabId: getTabIdFromPort(port), messageId: message.id });
    return;
  }

  const popupParams = {
    messageId: message.id,
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
