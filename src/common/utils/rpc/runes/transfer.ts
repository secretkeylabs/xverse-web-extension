import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import { type RunesTransferRequestMessage } from '@sats-connect/core';
import RoutePaths from 'app/routes/paths';
import { makeSendPopupClosedUserRejectionMessage } from '../helpers';

const handleTransferRunes = async (
  message: RunesTransferRequestMessage,
  port: chrome.runtime.Port,
) => {
  await openPopup({
    path: RoutePaths.TransferRunesRequest,
    data: message,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
    }),
  });
};

export default handleTransferRunes;
