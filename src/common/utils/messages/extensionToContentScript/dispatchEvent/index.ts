/* eslint-disable no-restricted-syntax */
import { type WalletEvent } from '@sats-connect/core';
import type { Permissions } from '@secretkeylabs/xverse-core';
import { contentScriptWalletEventMessageName } from '../schemas';
import {
  sendMessageAuthorizedConnectedClients,
  sendMessageConnectedClient,
  sendMessageConnectedClients,
  sendMessageToOrigin,
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
  permissions: Omit<Permissions.Store.Permission, 'clientId'>[],
  data: WalletEvent,
) {
  sendMessageAuthorizedConnectedClients(permissions, {
    type: contentScriptWalletEventMessageName,
    data,
  });
}

export async function dispatchEventToOrigin(origin: string, data: WalletEvent) {
  sendMessageToOrigin(origin, {
    type: contentScriptWalletEventMessageName,
    data,
  });
}
