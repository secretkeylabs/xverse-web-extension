/* eslint-disable no-void */
import type { LegacyMessageFromContentScript, WebBtcMessage } from '@common/types/message-types';
import { CONTENT_SCRIPT_PORT } from '@common/types/message-types';
import {
  handleLegacyExternalMethodFormat,
  isLegacyMessage,
} from '@common/utils/legacy-external-message-handler';
import internalBackgroundMessageHandler from '@common/utils/messageHandlers';
import handleRPCRequest from '@common/utils/rpc';
import { Requests } from 'sats-connect';

// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== CONTENT_SCRIPT_PORT) return;
  port.onMessage.addListener(
    (message: LegacyMessageFromContentScript | WebBtcMessage<keyof Requests>, messagingPort) => {
      if (isLegacyMessage(message)) {
        void handleLegacyExternalMethodFormat(message, messagingPort);
        // eslint-disable-next-line no-useless-return
        return;
      }
      void handleRPCRequest(message, port);
    },
  );
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
