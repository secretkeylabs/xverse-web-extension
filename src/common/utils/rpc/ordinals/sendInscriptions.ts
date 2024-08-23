import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import { sendInscriptionsSchema, type RpcRequestMessage } from '@sats-connect/core';
import RoutePaths from 'app/routes/paths';
import * as v from 'valibot';
import { handleInvalidMessage } from '../handle-invalid-message';
import { makeSendPopupClosedUserRejectionMessage } from '../helpers';

const handleSendInscriptions = async (message: RpcRequestMessage, port: chrome.runtime.Port) => {
  const parseResult = v.safeParse(sendInscriptionsSchema, message);

  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
    return;
  }

  await openPopup({
    path: RoutePaths.SendInscriptionsRequest,
    data: parseResult.output,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: parseResult.output.id,
    }),
  });
};

export default handleSendInscriptions;
