/* eslint-disable no-restricted-syntax */
import type { Permission } from '@components/permissionsManager/schemas';
import { type WalletEvent } from '@sats-connect/core';
import { contentScriptWalletEventMessageName } from '../schemas';
import {
  sendMessageAuthorizedConnectedClients,
  sendMessageConnectedClient,
  sendMessageConnectedClients,
} from '../utils';

/**
 * Notify all tabs of a connected client of an event from the extension's
 * context.
 * @public
 */
export async function dispatchEventConnectedClient(id: string, data: WalletEvent) {
  sendMessageConnectedClient(id, {
    type: contentScriptWalletEventMessageName,
    data,
  });
}

/**
 * Notify all tabs of all connected clients of an event from the extension's
 * context.
 * @public
 */
export async function dispatchEventConnectedClients(data: WalletEvent) {
  sendMessageConnectedClients({
    type: contentScriptWalletEventMessageName,
    data,
  });
}

/**
 * Notify all tabs of all authorized connected clients of an event from the
 * extension's context.
 * @public
 */
export async function dispatchEventAuthorizedConnectedClients(
  permission: Omit<Permission, 'clientId'>,
  data: WalletEvent,
) {
  sendMessageAuthorizedConnectedClients(permission, {
    type: contentScriptWalletEventMessageName,
    data,
  });
}
