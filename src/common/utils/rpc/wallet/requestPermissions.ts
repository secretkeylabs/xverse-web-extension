/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import { makeContext, openPopup } from '@common/utils/popup';
import * as utils from '@components/permissionsManager/utils';
import { requestPermissionsRequestMessageSchema, type RpcRequestMessage } from '@sats-connect/core';
import * as v from 'valibot';
import RequestsRoutes from '../../route-urls';
import { handleInvalidMessage } from '../handle-invalid-message';
import { hasAccountReadPermissions, makeSendPopupClosedUserRejectionMessage } from '../helpers';
import { sendRequestPermissionsSuccessResponseMessage } from '../responseMessages/wallet';

export const handleRequestPermissions = async (
  message: RpcRequestMessage,
  port: chrome.runtime.Port,
) => {
  const parseResult = v.safeParse(requestPermissionsRequestMessageSchema, message);

  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
    return;
  }

  const requestContext = makeContext(port);

  const [error, store] = await utils.getPermissionsStore();
  if (!error && hasAccountReadPermissions(requestContext.origin, store)) {
    sendRequestPermissionsSuccessResponseMessage({
      messageId: parseResult.output.id,
      tabId: requestContext.tabId,
      result: true,
    });
    return;
  }

  await openPopup({
    path: RequestsRoutes.ConnectionRequest,
    data: parseResult.output,
    context: requestContext,
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: parseResult.output.id,
    }),
  });
};
