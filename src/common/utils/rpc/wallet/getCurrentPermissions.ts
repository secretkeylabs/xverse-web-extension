/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import { makeContext } from '@common/utils/popup';
import * as utils from '@components/permissionsManager/utils';
import { type GetCurrentPermissionsRequestMessage } from '@sats-connect/core';
import { permissions } from '@secretkeylabs/xverse-core';
import { sendInternalErrorMessage } from '../responseMessages/errors';
import { sendGetCurrentPermissionsSuccessResponseMessage } from '../responseMessages/wallet';

export async function handleGetPermissions(
  message: GetCurrentPermissionsRequestMessage,
  port: chrome.runtime.Port,
) {
  const { origin, tabId } = makeContext(port);

  const [error, store] = await utils.getPermissionsStore();
  if (error) {
    sendInternalErrorMessage({
      tabId,
      messageId: message.id,
      message: 'Error loading permissions store.',
    });
    return;
  }

  const [clientIdError, clientId] = permissions.utils.store.makeClientId({ origin });
  if (clientIdError) {
    sendInternalErrorMessage({
      tabId,
      messageId: message.id,
      message: 'Error creating client ID.',
    });
    return;
  }

  sendGetCurrentPermissionsSuccessResponseMessage({
    tabId,
    messageId: message.id,
    result: permissions.utils.store.getClientPermissions(store.permissions, clientId),
  });
}
