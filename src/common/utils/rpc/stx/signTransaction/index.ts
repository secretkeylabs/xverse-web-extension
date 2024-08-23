import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import RequestsRoutes from '@common/utils/route-urls';
import { type RpcRequestMessage, stxSignTransactionRequestMessageSchema } from '@sats-connect/core';
import * as v from 'valibot';
import { handleInvalidMessage } from '../../handle-invalid-message';
import { makeSendPopupClosedUserRejectionMessage } from '../../helpers';
import { sendInvalidStacksTransactionMessage } from '../../responseMessages/errors';
import { isValidStacksTransaction } from './utils';

async function signTransaction(message: RpcRequestMessage, port: chrome.runtime.Port) {
  const parseResult = v.safeParse(stxSignTransactionRequestMessageSchema, message);

  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
    return;
  }

  if (!isValidStacksTransaction(parseResult.output.params.transaction)) {
    sendInvalidStacksTransactionMessage({ tabId: getTabIdFromPort(port), messageId: message.id });
    return;
  }

  await openPopup({
    path: RequestsRoutes.TransactionRequest,
    data: parseResult.output,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: parseResult.output.id,
    }),
  });
}

export default signTransaction;
