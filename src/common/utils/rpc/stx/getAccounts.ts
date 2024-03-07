import { WebBtcMessage } from '@common/types/message-types';
import { RpcErrorCode } from 'sats-connect';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../legacy-external-message-handler';
import RequestsRoutes from '../../route-urls';
import { makeRPCError } from '../helpers';

const handleGetStxAccounts = async (
  message: WebBtcMessage<'stx_getAccounts'>,
  port: chrome.runtime.Port,
) => {
  const { urlParams, tabId } = makeSearchParamsWithDefaults(port);

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
