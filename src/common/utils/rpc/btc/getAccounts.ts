/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import { type GetAccountsRequestMessage } from '@sats-connect/core';
import RequestsRoutes from '../../route-urls';
import { makeSendPopupClosedUserRejectionMessage } from '../helpers';

export const handleGetAccounts = async (
  message: GetAccountsRequestMessage,
  port: chrome.runtime.Port,
) => {
  await openPopup({
    path: RequestsRoutes.AddressRequest,
    data: message,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
    }),
  });
};
