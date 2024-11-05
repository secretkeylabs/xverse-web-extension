import type { Permission } from '@components/permissionsManager/schemas';
import { getPermissionsStore } from '@components/permissionsManager/utils';
import { type ContentScriptMessage } from '../schemas';

/**
 * Send a message to a tab's content script from the extension's context.
 * @public
 */
export async function sendMessageContentScriptTab(tabId: number, message: ContentScriptMessage) {
  chrome.tabs.sendMessage(tabId, message);
}

/**
 * Send a message to multiple tabs' content scripts from the extension's
 * context.
 * @public
 */
export async function sendMessageContentScriptTabs(
  tabIds: number[],
  message: ContentScriptMessage,
) {
  tabIds.forEach((tabId) => sendMessageContentScriptTab(tabId, message));
}

// TODO: is this necessary? The Chrome dev docs aren't clear on whether the
// origin will match all paths.
//
// - https://developer.chrome.com/docs/extensions/reference/api/tabs#method-query
// - https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns.
function clientOriginToUrlMatchPattern(tabOrigin: string) {
  return `${tabOrigin}/*`;
}

/**
 * Send a message to all tabs of a connected client from the extension's
 * context.
 * @public
 */
export async function sendMessageConnectedClient(id: string, message: ContentScriptMessage) {
  const [error, store] = await getPermissionsStore();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load permissions store:', error);
    return;
  }

  if (!store) {
    // eslint-disable-next-line no-console
    console.error('Unable to notify connected clients, no permissions store found.');
    return;
  }

  const client = [...store.clients].find((c) => c.id === id);

  if (!client) {
    // eslint-disable-next-line no-console
    console.warn('Unable to notify connected client, no client found with id:', id);
    return;
  }

  const url = clientOriginToUrlMatchPattern(client.origin);

  const clientTabs = (await chrome.tabs.query({ url })).filter(
    (tab): tab is chrome.tabs.Tab & { readonly id: number } => typeof tab.id === 'number',
  );

  sendMessageContentScriptTabs(
    clientTabs.map((tab) => tab.id),
    message,
  );
}

/**
 * Send a message to all tabs of all connected clients from the extension's
 * context.
 * @public
 */
export async function sendMessageConnectedClients(message: ContentScriptMessage) {
  const [error, store] = await getPermissionsStore();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load permissions store:', error);
    return;
  }

  if (!store) {
    // eslint-disable-next-line no-console
    console.warn('Unable to notify connected clients, no permissions store found.');
    return;
  }

  const origins = [...store.clients].map((c) => c.origin);
  const urlMatchPatterns = origins.map(clientOriginToUrlMatchPattern);

  const clientTabs = (await chrome.tabs.query({ url: urlMatchPatterns })).filter(
    (tab): tab is chrome.tabs.Tab & { readonly id: number } => typeof tab.id === 'number',
  );

  sendMessageContentScriptTabs(
    clientTabs.map((tab) => tab.id),
    message,
  );
}

/**
 * Send a message to all tabs of all authorized connected clients from the
 * extension's context.
 * @public
 */
export async function sendMessageAuthorizedConnectedClients(
  permissions: Omit<Permission, 'clientId'>[],
  message: ContentScriptMessage,
) {
  const [error, store] = await getPermissionsStore();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load permissions store:', error);
    return;
  }

  if (!store) {
    // eslint-disable-next-line no-console
    console.warn('Unable to notify connected clients, no permissions store found.');
    return;
  }

  const authorizedClientIds = [...store.permissions]
    .filter((p) =>
      permissions.some(
        (permission) =>
          p.resourceId === permission.resourceId &&
          [...permission.actions].every((action) => p.actions.has(action)),
      ),
    )
    .map((p) => p.clientId);

  const origins = authorizedClientIds
    .map((id) => {
      const client = [...store.clients].find((c) => c.id === id);
      return client?.origin;
    })
    .filter((origin) => typeof origin === 'string');

  const urlMatchPatterns = origins.map(clientOriginToUrlMatchPattern);

  if (urlMatchPatterns.length === 0) {
    // When used for the `url` parameter of `chrome.tabs.query`, an empty array
    // will match all tabs. However, no urls to match against means no tabs to
    // send messages to, so we can return early.
    return;
  }

  const clientTabs = (await chrome.tabs.query({ url: urlMatchPatterns })).filter(
    (tab): tab is chrome.tabs.Tab & { readonly id: number } => typeof tab.id === 'number',
  );

  sendMessageContentScriptTabs(
    clientTabs.map((tab) => tab.id),
    message,
  );
}

export async function sendMessageToOrigin(origin: string, message: ContentScriptMessage) {
  const url = clientOriginToUrlMatchPattern(origin);
  const clientTabs = (await chrome.tabs.query({ url })).filter(
    (tab): tab is chrome.tabs.Tab & { readonly id: number } => typeof tab.id === 'number',
  );
  sendMessageContentScriptTabs(
    clientTabs.map((tab) => tab.id),
    message,
  );
}
