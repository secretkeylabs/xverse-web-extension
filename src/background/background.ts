/* eslint-disable no-void */
import internalBackgroundMessageHandler from '@common/utils/messageHandlers';
import {
  handleLegacyExternalMethodFormat,
  inferLegacyMessage,
} from '@common/utils/legacy-external-message-handler';
import { CONTENT_SCRIPT_PORT } from '@common/types/message-types';
import type { LegacyMessageFromContentScript } from '@common/types/message-types';

// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== CONTENT_SCRIPT_PORT) return;
  port.onMessage.addListener((message: LegacyMessageFromContentScript, port) => {
    if (inferLegacyMessage(message)) {
      void handleLegacyExternalMethodFormat(message, port);
      // eslint-disable-next-line no-useless-return
      return;
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void internalBackgroundMessageHandler(message, sender, sendResponse);
  return true;
});

const storageArea = chrome.storage.local as chrome.storage.LocalStorageArea;

const testIntervalMs = 10000;
const storageWaitTimeMs = 100;

async function hasChromiumIssue1316588() {
  return new Promise((resolve) => {
    let dispatched = false;
    const testEventDispatching = () => {
      storageArea.onChanged.removeListener(testEventDispatching);
      dispatched = true;
    };
    storageArea.onChanged.addListener(testEventDispatching);
    void storageArea.set({ testEventDispatching: Math.random() });
    setTimeout(() => resolve(!dispatched), storageWaitTimeMs);
  });
}

function fixChromiumIssue1316588() {
  void hasChromiumIssue1316588().then((hasIssue) => {
    if (hasIssue) {
      chrome.runtime.reload();
      return;
    }

    setTimeout(fixChromiumIssue1316588, testIntervalMs);
  });
}

fixChromiumIssue1316588();
