/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import { type RequestPermissionsRequestMessage } from '@sats-connect/core';
import { sendInternalErrorMessage } from '../responseMessages/errors';
import { handleConnect } from './connect';

export const handleRequestPermissions = async (
  message: RequestPermissionsRequestMessage,
  port: chrome.runtime.Port,
) => {
  if (!message.params) {
    // Legacy support. Previously, `wallet_requestPermissions` was being used as
    // `wallet_connect` is being used now: when no params are provided, it
    // grants read perms to the account. Although `wallet_requestPermissions` is
    // meant to be used to request specific permissions, we default to granting
    // account read permissions if none are provided to maintain backwards
    // compatibility by using the `wallet_connect` handler.
    return handleConnect({ ...message, method: 'wallet_connect', params: undefined }, port);
  }

  // Handling requests for specific permissions has not yet been implemented.
  sendInternalErrorMessage({
    tabId: getTabIdFromPort(port),
    messageId: message.id,
    message:
      'The wallet does not yet support requesting individual permissions. ' +
      'Use `request("wallet_connect", undefined)` to get account read permissions.',
  });
};
