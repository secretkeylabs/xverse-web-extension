/* eslint-disable import/prefer-default-export */
import { dispatchEventToOrigin } from '@common/utils/messages/extensionToContentScript/dispatchEvent';
import { makeContext } from '@common/utils/popup';
import * as utils from '@components/permissionsManager/utils';
import { type RenouncePermissionsRequestMessage } from '@sats-connect/core';
import { permissions } from '@secretkeylabs/xverse-core';
import { sendInternalErrorMessage } from '../responseMessages/errors';
import { sendRenouncePermissionsSuccessResponseMessage } from '../responseMessages/wallet';

export const handleRenouncePermissions = async (
  message: RenouncePermissionsRequestMessage,
  port: chrome.runtime.Port,
) => {
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

  await utils.permissionsStoreMutex.runExclusive(async () => {
    permissions.utils.store.removeClient(store, clientId);
    utils.savePermissionsStore(store);
  });

  dispatchEventToOrigin(origin, {
    type: 'disconnect',
  });

  sendRenouncePermissionsSuccessResponseMessage({
    tabId,
    messageId: message.id,
    result: null,
  });
};
