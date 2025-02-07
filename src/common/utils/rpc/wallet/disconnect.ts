/* eslint-disable import/prefer-default-export */
import { dispatchEventToOrigin } from '@common/utils/messages/extensionToContentScript/dispatchEvent';
import { initPermissionsStore, saveStore } from '@common/utils/permissionsStore';
import { makeContext } from '@common/utils/popup';
import { type DisconnectRequestMessage } from '@sats-connect/core';
import { permissions } from '@secretkeylabs/xverse-core';
import { sendInternalErrorMessage } from '../responseMessages/errors';
import { sendRenouncePermissionsSuccessResponseMessage } from '../responseMessages/wallet';

export const handleDisconnect = async (
  message: DisconnectRequestMessage,
  port: chrome.runtime.Port,
) => {
  const { origin, tabId } = makeContext(port);
  const [error, store] = await initPermissionsStore();

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

  saveStore(permissions.utils.store.removeClient(store, clientId));

  dispatchEventToOrigin(origin, {
    type: 'disconnect',
  });

  sendRenouncePermissionsSuccessResponseMessage({
    tabId,
    messageId: message.id,
    result: null,
  });
};
