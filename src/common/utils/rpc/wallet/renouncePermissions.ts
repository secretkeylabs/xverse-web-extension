/* eslint-disable import/prefer-default-export */
import { type RenouncePermissionsRequestMessage } from '@sats-connect/core';
import { handleDisconnect } from './disconnect';

export const handleRenouncePermissions = async (
  message: RenouncePermissionsRequestMessage,
  port: chrome.runtime.Port,
) => {
  // Renouncing individual permissions is not yet implemented, so all
  // permissions are renounced by disconnecting.
  handleDisconnect({ ...message, method: 'wallet_disconnect' }, port);
};
