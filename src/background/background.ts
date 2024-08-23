/* eslint-disable no-void */
import { CONTENT_SCRIPT_PORT } from '@common/types/message-types';
import { handleLegacyExternalMethodFormat } from '@common/utils/legacy-external-message-handler';
import internalBackgroundMessageHandler from '@common/utils/messageHandlers';
import handleRPCRequest from '@common/utils/rpc';
import { initPermissionsStore, permissionsStoreMutex } from '@components/permissionsManager/utils';
import { rpcRequestMessageSchema } from '@sats-connect/core';
import * as v from 'valibot';

async function init() {
  const [error] = await permissionsStoreMutex.runExclusive(initPermissionsStore);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load permissions store:', error);
  }

  // Listen for connection to the content-script - port for two-way communication
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== CONTENT_SCRIPT_PORT) return;
    port.onMessage.addListener((message, messagingPort) => {
      const parseResult = v.safeParse(rpcRequestMessageSchema, message);

      if (!parseResult.success) {
        // Assume it's a legacy message when parsing fails.
        handleLegacyExternalMethodFormat(message, messagingPort);
        return;
      }

      handleRPCRequest(parseResult.output, port);
    });
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    void internalBackgroundMessageHandler(message, sender, sendResponse);
    // Listener fn must return `true` to indicate the response will be async
    return true;
  });

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html#/landing') });
    }
  });

  if (process.env.WALLET_LABEL) {
    chrome.action.setBadgeText({ text: process.env.WALLET_LABEL });
  } else if (process.env.NODE_ENV === 'development') {
    chrome.action.setBadgeText({ text: 'DEV' });
  }
}

await init().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('Failed to initialize background script:', e);
});
