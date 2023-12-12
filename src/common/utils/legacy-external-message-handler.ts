import { SignatureData } from '@stacks/connect';
import {
  ExternalMethods,
  ExternalSatsMethods,
  InternalMethods,
  LegacyMessageFromContentScript,
  LegacyMessageToContentScript,
  MESSAGE_SOURCE,
  SatsConnectMessageFromContentScript,
  SatsConnectMessageToContentScript,
  SignatureResponseMessage,
} from '../types/message-types';
import { sendMessage } from '../types/messages';
import popupCenter from './popup-center';
import RequestsRoutes from './route-urls';

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
  response: LegacyMessageToContentScript | SatsConnectMessageToContentScript;
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

async function triggerRequestWindowOpen(path: RequestsRoutes, urlParams: URLSearchParams) {
  return popupCenter({ url: `/popup.html#${path}?${urlParams.toString()}` });
}

export async function handleLegacyExternalMethodFormat(
  message: LegacyMessageFromContentScript | SatsConnectMessageFromContentScript,
  port: chrome.runtime.Port,
) {
  const { payload } = message;
  switch (message.method) {
    case ExternalMethods.authenticationRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [['authRequest', payload]]);
      const { id } = await triggerRequestWindowOpen(
        RequestsRoutes.AuthenticationRequest,
        urlParams,
      );
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

      const { id } = await triggerRequestWindowOpen(RequestsRoutes.TransactionRequest, urlParams);
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

      const { id } = await triggerRequestWindowOpen(RequestsRoutes.SignatureRequest, urlParams);
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

      const { id } = await triggerRequestWindowOpen(RequestsRoutes.SignatureRequest, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: formatMessageSigningResponse({ request: payload, response: 'cancel' }),
      });
      listenForOriginTabClose({ tabId });
      break;
    }
    case ExternalSatsMethods.getAddressRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
        ['addressRequest', payload],
      ]);

      const { id } = await triggerRequestWindowOpen(RequestsRoutes.AddressRequest, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: {
          source: MESSAGE_SOURCE,
          payload: {
            addressRequest: payload,
            addressResponse: 'cancel',
          },
          method: ExternalSatsMethods.getAddressResponse,
        },
      });
      listenForOriginTabClose({ tabId });
      break;
    }
    case ExternalSatsMethods.signPsbtRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
        ['signPsbtRequest', payload],
      ]);

      const { id } = await triggerRequestWindowOpen(RequestsRoutes.SignBtcTx, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: {
          source: MESSAGE_SOURCE,
          payload: {
            signPsbtRequest: payload,
            signPsbtResponse: 'cancel',
          },
          method: ExternalSatsMethods.signPsbtResponse,
        },
      });
      listenForOriginTabClose({ tabId });
      break;
    }
    case ExternalSatsMethods.signBatchPsbtRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
        ['signBatchPsbtRequest', payload],
      ]);

      const { id } = await triggerRequestWindowOpen(RequestsRoutes.SignBatchBtcTx, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: {
          source: MESSAGE_SOURCE,
          payload: {
            signBatchPsbtRequest: payload,
            signBatchPsbtResponse: 'cancel',
          },
          method: ExternalSatsMethods.signBatchPsbtResponse,
        },
      });
      listenForOriginTabClose({ tabId });
      break;
    }
    case ExternalSatsMethods.signMessageRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
        ['signMessageRequest', payload],
      ]);

      const { id } = await triggerRequestWindowOpen(RequestsRoutes.SignatureRequest, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: {
          source: MESSAGE_SOURCE,
          payload: {
            signMessageRequest: payload,
            signMessageResponse: 'cancel',
          },
          method: ExternalSatsMethods.signMessageResponse,
        },
      });
      listenForOriginTabClose({ tabId });
      break;
    }
    case ExternalSatsMethods.sendBtcRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
        ['sendBtcRequest', payload],
      ]);

      const { id } = await triggerRequestWindowOpen(RequestsRoutes.SendBtcTx, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: {
          source: MESSAGE_SOURCE,
          payload: {
            sendBtcRequest: payload,
            sendBtcResponse: 'cancel',
          },
          method: ExternalSatsMethods.sendBtcResponse,
        },
      });
      listenForOriginTabClose({ tabId });
      break;
    }
    case ExternalSatsMethods.createInscriptionRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
        ['createInscription', payload],
      ]);

      const { id } = await triggerRequestWindowOpen(RequestsRoutes.CreateInscription, urlParams);
      listenForPopupClose({
        id,
        tabId,
        response: {
          source: MESSAGE_SOURCE,
          payload: {
            createInscriptionRequest: payload,
            createInscriptionResponse: 'cancel',
          },
          method: ExternalSatsMethods.createInscriptionResponse,
        },
      });
      listenForOriginTabClose({ tabId });
      break;
    }
    case ExternalSatsMethods.createRepeatInscriptionsRequest: {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
        ['createRepeatInscriptions', payload],
      ]);

      const { id } = await triggerRequestWindowOpen(
        RequestsRoutes.CreateRepeatInscriptions,
        urlParams,
      );
      listenForPopupClose({
        id,
        tabId,
        response: {
          source: MESSAGE_SOURCE,
          payload: {
            createRepeatInscriptionsRequest: payload,
            createRepeatInscriptionsResponse: 'cancel',
          },
          method: ExternalSatsMethods.createRepeatInscriptionsResponse,
        },
      });
      listenForOriginTabClose({ tabId });
      break;
    }
    default: {
      break;
    }
  }
}
