/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import RequestsRoutes from '@common/utils/route-urls';
import { type StxSignTransactionsRequestMessage } from '@sats-connect/core';
import { makeSendPopupClosedUserRejectionMessage } from '../../helpers';

export async function signTransactions(
  message: StxSignTransactionsRequestMessage,
  port: chrome.runtime.Port,
) {
  await openPopup({
    path: RequestsRoutes.StxSignTransactions,
    data: message,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
    }),
  });
}
