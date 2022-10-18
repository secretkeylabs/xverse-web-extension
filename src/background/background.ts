//
// This file is the entrypoint to the extension's background script
// https://developer.chrome.com/docs/extensions/mv3/architecture-overview/#background_script

import { CONTENT_SCRIPT_PORT } from '../content-scripts/message-types';
import type { LegacyMessageFromContentScript } from '../content-scripts/message-types';
import {
  handleLegacyExternalMethodFormat,
  inferLegacyMessage,
} from './legacy-external-message-handler';

// initContextMenuActions();

// const IS_TEST_ENV = process.env.TEST_ENV === 'true';

// chrome.runtime.onInstalled.addListener(async (details) => {
//   if (details.reason === 'install' && !IS_TEST_ENV) {
//     await chrome.tabs.create({ url: chrome.runtime.getURL(`index.html#${RouteUrls.Onboarding}`) });
//   }
// });

// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== CONTENT_SCRIPT_PORT) return;

  port.onMessage.addListener((message: LegacyMessageFromContentScript, port) => {
    if (inferLegacyMessage(message)) {
      void handleLegacyExternalMethodFormat(message, port);
      return;
    }

    // TODO:
    // Here we'll handle all messages using the rpc style comm method
    // For now all messages are handled as legacy format
  });
});
