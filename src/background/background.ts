/* eslint-disable no-void */
import {
  handleLegacyExternalMethodFormat,
  inferLegacyMessage,
} from '@common/utils/legacy-external-message-handler';
import { CONTENT_SCRIPT_PORT } from '@common/types/message-types';
import type { LegacyMessageFromContentScript } from '@common/types/message-types';

// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== CONTENT_SCRIPT_PORT) return;
  port.onMessage.addListener((message: LegacyMessageFromContentScript, messagingPort) => {
    if (inferLegacyMessage(message)) {
      void handleLegacyExternalMethodFormat(message, messagingPort);
      // eslint-disable-next-line no-useless-return
      return;
    }
  });
});
