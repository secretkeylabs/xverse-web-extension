/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import { makeContext } from '@common/utils/popup';
import * as utils from '@components/permissionsManager/utils';
import { RpcRequestMessage, renouncePermissionsRequestMessageSchema } from '@sats-connect/core';
import * as v from 'valibot';
import { handleInvalidMessage } from '../handle-invalid-message';
import {
  sendAccessDeniedResponseMessage,
  sendInternalErrorMessage,
} from '../responseMessages/errors';
import { sendRequestPermissionsSuccessResponseMessage } from '../responseMessages/wallet';

export const handleRenouncePermissions = async (
  message: RpcRequestMessage,
  port: chrome.runtime.Port,
) => {
  const parseResult = v.safeParse(renouncePermissionsRequestMessageSchema, message);

  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
    return;
  }

  const { origin, tabId } = makeContext(port);
  const [error, store] = await utils.loadPermissionsStore();

  if (error) {
    sendInternalErrorMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

  if (!store) {
    sendAccessDeniedResponseMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

  await utils.permissionsStoreMutex.runExclusive(async () => {
    utils.removeClient(store.clients, store.permissions, origin);
    utils.savePermissionsStore(store);
  });

  sendRequestPermissionsSuccessResponseMessage({
    tabId,
    messageId: parseResult.output.id,
    result: true,
  });
};
