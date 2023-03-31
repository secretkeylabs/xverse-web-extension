/* eslint-disable no-underscore-dangle */
import internalBackgroundMessageHandler from '@common/utils/messageHandlers';
import {
  handleLegacyExternalMethodFormat,
  inferLegacyMessage,
} from '@common/utils/legacy-external-message-handler';
import { CONTENT_SCRIPT_PORT } from '@common/types/message-types';
import type { LegacyMessageFromContentScript } from '@common/types/message-types';
import popupCenter from '@common/utils/popup-center';
import RequestsRoutes from '@common/utils/route-urls';

function deleteTimer(port) {
  if (port._timer) {
    clearTimeout(port._timer);
    delete port._timer;
  }
}
function forceReconnect(port) {
  deleteTimer(port);
  port.disconnect();
}

// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== CONTENT_SCRIPT_PORT) return;
  port._timer = setTimeout(forceReconnect, 250e3, port);
  port.onMessage.addListener((message: LegacyMessageFromContentScript, port) => {
    if (inferLegacyMessage(message)) {
      void handleLegacyExternalMethodFormat(message, port);
      // eslint-disable-next-line no-useless-return
      return;
    }
  });
  port.onDisconnect.addListener(deleteTimer);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void internalBackgroundMessageHandler(message, sender, sendResponse);
  // Listener fn must return `true` to indicate the response will be async
  return true;
});

export interface RequestInterface {
  action: 'dlc.offerRequest';
  data: {
    offer: string;
    counterpartyWalletUrl: string;
  };
}

chrome.runtime.onMessageExternal.addListener(async function (
  request: RequestInterface,
  sender,
  sendResponse
) {
  switch (request.action) {
    case 'dlc.offerRequest': {
      console.log('[BG script]: request.data:', request.data);
      const offerURI = encodeURIComponent(JSON.stringify(request.data.offer));
      const counterpartyWalletUrlURI = encodeURIComponent(request.data.counterpartyWalletUrl);
      const url = `/popup.html#${RequestsRoutes.DlcGetOfferRequest}/${offerURI}/${counterpartyWalletUrlURI}`;
      console.log(url);
      await popupCenter({
        url,
      });
      break;
    }
  }
  sendResponse({ success: true });
});
