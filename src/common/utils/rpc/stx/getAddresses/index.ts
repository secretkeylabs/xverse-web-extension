import { WebBtcMessage } from '@common/types/message-types';
import { RpcErrorCode } from '@sats-connect/core';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../../legacy-external-message-handler';
import RequestsRoutes from '../../../route-urls';
import { makeRPCError } from '../../helpers';

const handleGetStxAddresses = async (
  message: WebBtcMessage<'stx_getAddresses'>,
  port: chrome.runtime.Port,
) => {
  const popupParams = {
    messageId: message.id,
    rpcMethod: 'stx_getAddresses',
  };

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, popupParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.StxAddressRequest, urlParams);
  listenForPopupClose({
    tabId,
    id,
    response: makeRPCError(message.id, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'User rejected request to get addresses',
    }),
  });
};

export default handleGetStxAddresses;
