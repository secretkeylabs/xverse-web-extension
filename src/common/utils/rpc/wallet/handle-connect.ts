/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import { RpcRequestMessage, connectRequestMessageSchema } from '@sats-connect/core';
import * as v from 'valibot';
import RequestsRoutes from '../../route-urls';
import { handleInvalidMessage } from '../handle-invalid-message';
import { makeSendPopupClosedUserRejectionMessage } from '../helpers';

export const handleConnect = async (message: RpcRequestMessage, port: chrome.runtime.Port) => {
  const parseResult = v.safeParse(connectRequestMessageSchema, message);

  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
    return;
  }

  await openPopup({
    path: RequestsRoutes.ConnectionRequest,
    data: parseResult.output,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: parseResult.output.id,
    }),
  });
};
