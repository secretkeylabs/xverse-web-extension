/* eslint-disable no-void */
import { CONTENT_SCRIPT_PORT } from '@common/types/message-types';
import { handleLegacyExternalMethodFormat } from '@common/utils/legacy-external-message-handler';
import internalBackgroundMessageHandler from '@common/utils/messageHandlers';
import handleRPCRequest from '@common/utils/rpc';
import { initPermissionsStore, permissionsStoreMutex } from '@components/permissionsManager/utils';
import { rpcRequestMessageSchema } from '@sats-connect/core';
import * as v from 'valibot';

let hasInitializationFinished = false;
permissionsStoreMutex
  .runExclusive(initPermissionsStore)
  .catch(([error]) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load permissions store:', error);
    }
  })
  // Even if the store initialization fails, the initialization is considered to
  // have finished. This allows the app to continue running after a failure
  // since many of the app's features are not dependent on the permissions
  // store.
  .finally(() => {
    hasInitializationFinished = true;
  });

// All event handlers that could potentially lead to the permissions store
// being accessed should wait for the store to be initialized before
// proceeding.
async function waitForStoreInitialization() {
  if (hasInitializationFinished) return;
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (hasInitializationFinished) {
        clearInterval(interval);
        resolve(undefined);
      }
    }, 10);
  });
}

// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== CONTENT_SCRIPT_PORT) return;

  async function onMessageListener(message: any, messagingPort: chrome.runtime.Port) {
    await waitForStoreInitialization();
    const parseResult = v.safeParse(rpcRequestMessageSchema, message);

    if (!parseResult.success) {
      // Assume it's a legacy message when parsing fails.
      handleLegacyExternalMethodFormat(message, messagingPort);
      return;
    }

    handleRPCRequest(parseResult.output, port);
  }

  port.onMessage.addListener((message, messagingPort) => {
    onMessageListener(message, messagingPort).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to handle message:', error);
    });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void internalBackgroundMessageHandler(message, sender, sendResponse);
  // Listener fn must return `true` to indicate the response will be async
  return true;
});

async function onInstalledListener(details: chrome.runtime.InstalledDetails) {
  await waitForStoreInitialization();
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html#/landing') });
  }
}
chrome.runtime.onInstalled.addListener((details) => {
  onInstalledListener(details).catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to handle onInstalled event:', error);
  });
});

if (process.env.WALLET_LABEL) {
  chrome.action.setBadgeText({ text: process.env.WALLET_LABEL });
} else if (process.env.NODE_ENV === 'development') {
  chrome.action.setBadgeText({ text: 'DEV' });
}
