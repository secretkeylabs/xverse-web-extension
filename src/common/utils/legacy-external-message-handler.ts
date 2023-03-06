import { SignatureData } from '@stacks/connect';
import {
  ExternalMethods,
  InternalMethods,
  LegacyMessageFromContentScript,
  LegacyMessageToContentScript,
  MESSAGE_SOURCE,
  SignatureResponseMessage,
} from '../types/message-types';
import { sendMessage } from '../types/messages';
import RequestsRoutes from './route-urls';
import popupCenter from './popup-center';

export function inferLegacyMessage(message: any): message is LegacyMessageFromContentScript {
  // Now that we use a RPC communication style, we can infer
  // legacy message types by presence of an id
  const hasIdProp = 'id' in message;
  return !hasIdProp;
}

function getTabIdFromPort(port: chrome.runtime.Port) {
  return port.sender?.tab?.id;
}

function getOriginFromPort(port: chrome.runtime.Port) {
  if (port.sender?.url) return new URL(port.sender.url).origin;
  return port.sender?.origin;
}

function makeSearchParamsWithDefaults(
  port: chrome.runtime.Port,
  otherParams: [string, string][] = [],
) {
  const urlParams = new URLSearchParams();
  // All actions must have a corresponding `origin` and `tabId`
  const origin = getOriginFromPort(port);
  const tabId = getTabIdFromPort(port);
  urlParams.set('origin', origin ?? '');
  urlParams.set('tabId', tabId?.toString() ?? '');
  otherParams.forEach(([key, value]) => urlParams.set(key, value));
  return { urlParams, origin, tabId };
}

interface ListenForPopupCloseArgs {
  // ID that comes from newly created window
  id?: number;
  // TabID from requesting tab, to which request should be returned
  tabId?: number;
  response: LegacyMessageToContentScript;
}
function listenForPopupClose({ id, tabId, response }: ListenForPopupCloseArgs) {
  chrome.windows.onRemoved.addListener((winId) => {
    if (winId !== id || !tabId) return;
    const responseMessage = response;
    chrome.tabs.sendMessage(tabId, responseMessage);
  });
}

interface FormatMessageSigningResponseArgs {
  request: string;
  response: SignatureData | string;
}
export function formatMessageSigningResponse({
  request,
  response,
}: FormatMessageSigningResponseArgs): SignatureResponseMessage {
  return {
    source: MESSAGE_SOURCE,
    method: ExternalMethods.signatureResponse,
    payload: { signatureRequest: request, signatureResponse: response },
  };
}

interface ListenForOriginTabCloseArgs {
  tabId?: number;
}
function listenForOriginTabClose({ tabId }: ListenForOriginTabCloseArgs) {
  chrome.tabs.onRemoved.addListener((closedTabId) => {
    if (tabId !== closedTabId) return;
    sendMessage({ method: InternalMethods.OriginatingTabClosed, payload: { tabId } });
  });
}

async function triggerRequstWindowOpen(path: RequestsRoutes, urlParams: URLSearchParams) {
  return popupCenter({ url: `/popup.html#${path}?${urlParams.toString()}` });
}

export async function handleLegacyExternalMethodFormat(
  message: LegacyMessageFromContentScript,
  port: chrome.runtime.Port,
) {
  const { payload } = message;
  switch (message.method) {
    case ExternalMethods.authenticationRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [['authRequest', payload]]);
      const { id } = await triggerRequstWindowOpen(RequestsRoutes.AuthenticationRequest, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: {
          source: MESSAGE_SOURCE,
          payload: {
            authenticationRequest: payload,
            authenticationResponse: 'cancel',
          },
          method: ExternalMethods.authenticationResponse,
        },
      });
      listenForOriginTabClose({ tabId });
      break;
    }

    case ExternalMethods.transactionRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [['request', payload]]);

      const { id } = await triggerRequstWindowOpen(RequestsRoutes.TransactionRequest, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: {
          source: MESSAGE_SOURCE,
          method: ExternalMethods.transactionResponse,
          payload: {
            transactionRequest: payload,
            transactionResponse: 'cancel',
          },
        },
      });
      listenForOriginTabClose({ tabId });
      break;
    }

    case ExternalMethods.signatureRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
        ['request', payload],
        ['messageType', 'utf8'],
      ]);

      const { id } = await triggerRequstWindowOpen(RequestsRoutes.SignatureRequest, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: formatMessageSigningResponse({ request: payload, response: 'cancel' }),
      });
      listenForOriginTabClose({ tabId });
      break;
    }

    case ExternalMethods.structuredDataSignatureRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
        ['request', payload],
        ['messageType', 'structured'],
      ]);

      const { id } = await triggerRequstWindowOpen(RequestsRoutes.SignatureRequest, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: formatMessageSigningResponse({ request: payload, response: 'cancel' }),
      });
      listenForOriginTabClose({ tabId });
      break;
    }
    default: {
      break;
    }
  }
}
