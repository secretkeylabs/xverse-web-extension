import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import { RpcRequestMessage, getAccountsRequestMessageSchema } from '@sats-connect/core';
import * as v from 'valibot';
import RequestsRoutes from '../../route-urls';
import { handleInvalidMessage } from '../handle-invalid-message';
import { makeSendPopupClosedUserRejectionMessage } from '../helpers';

export const handleGetAccounts = async (message: RpcRequestMessage, port: chrome.runtime.Port) => {
  const parseResult = v.safeParse(getAccountsRequestMessageSchema, message);

  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
    return;
  }

  await openPopup({
    path: RequestsRoutes.AddressRequest,
    data: parseResult.output,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: parseResult.output.id,
    }),
  });
};

export default handleGetAccounts;
