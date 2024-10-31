import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import type { SendInscriptionsRequestMessage } from '@sats-connect/core';
import RoutePaths from 'app/routes/paths';
import { makeSendPopupClosedUserRejectionMessage } from '../helpers';

const handleSendInscriptions = async (
  message: SendInscriptionsRequestMessage,
  port: chrome.runtime.Port,
) => {
  await openPopup({
    path: RoutePaths.SendInscriptionsRequest,
    data: message,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
    }),
  });
};

export default handleSendInscriptions;
