/* eslint-disable no-void */
import { CONTENT_SCRIPT_PORT } from '@common/types/message-types';
import { handleLegacyExternalMethodFormat } from '@common/utils/legacy-external-message-handler';
import handleRPCRequest from '@common/utils/rpc';
import { rpcRequestMessageSchema } from '@sats-connect/core';
import * as v from 'valibot';

// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== CONTENT_SCRIPT_PORT) return;

  async function onMessageListener(message: any, messagingPort: chrome.runtime.Port) {
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

async function onInstalledListener(details: chrome.runtime.InstalledDetails) {
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

chrome.runtime.setUninstallURL(
  'https://docs.google.com/forms/d/e/1FAIpQLSe2byONVfL2rgWYo-iYePFMGiXRDMk4ZbMBCyK1RFIxLwZyog/viewform?usp=dialog',
);

if (process.env.WALLET_LABEL) {
  chrome.action.setBadgeText({ text: process.env.WALLET_LABEL });
} else if (process.env.NODE_ENV === 'development') {
  chrome.action.setBadgeText({ text: 'DEV' });
}
