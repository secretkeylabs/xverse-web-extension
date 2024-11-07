/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import RequestsRoutes from '@common/utils/route-urls';
import { type StxSignTransactionRequestMessage } from '@sats-connect/core';
import { makeSendPopupClosedUserRejectionMessage } from '../../helpers';
import { sendInvalidStacksTransactionMessage } from '../../responseMessages/errors';
import { isValidStacksTransaction } from './utils';

export async function signTransaction(
  message: StxSignTransactionRequestMessage,
  port: chrome.runtime.Port,
) {
  if (!isValidStacksTransaction(message.params.transaction)) {
    sendInvalidStacksTransactionMessage({ tabId: getTabIdFromPort(port), messageId: message.id });
    return;
  }

  await openPopup({
    path: RequestsRoutes.TransactionRequest,
    data: message,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
    }),
  });
}
