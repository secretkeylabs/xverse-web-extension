import {
  DomEventName,
  type AuthenticationRequestEvent,
  type CreateInscriptionEvent,
  type CreateRepeatInscriptionsEvent,
  type GetAddressRequestEvent,
  type SendBtcRequestEvent,
  type SignBatchPsbtRequestEvent,
  type SignMessageRequestEvent,
  type SignPsbtRequestEvent,
  type SignatureRequestEvent,
  type TransactionRequestEvent,
} from '@common/types/inpage-types';
import {
  CONTENT_SCRIPT_PORT,
  MESSAGE_SOURCE,
  SatsConnectMethods,
  StacksLegacyMethods,
  type LegacyMessageFromContentScript,
  type SatsConnectMessageFromContentScript,
} from '@common/types/message-types';
import getEventSourceWindow from '@common/utils/get-event-source-window';
import { contentScriptWalletEventMessageSchema } from '@common/utils/messages/extensionToContentScript/schemas';

import RequestsRoutes from '@common/utils/route-urls';
import { walletEventName } from '@common/walletEvents';
import { getIsPriorityWallet } from '@utils/chromeLocalStorage';
import * as v from 'valibot';

// Legacy messaging to work with older versions of Connect
window.addEventListener('message', (event) => {
  const { data } = event;
  if (data.source === 'xverse-app') {
    const { method } = data;
    if (method === 'getURL') {
      const url = chrome.runtime.getURL('options.html');
      const source = getEventSourceWindow(event);
      source?.postMessage(
        {
          url,
          method: 'getURLResponse',
          source: 'xverse-extension',
        },
        event.origin,
      );
    }
  }
});

// Connection to background script - fires onConnect event in background script
// and establishes two-way communication
let backgroundPort: chrome.runtime.Port;

function connect() {
  backgroundPort = chrome.runtime.connect({ name: CONTENT_SCRIPT_PORT });
  backgroundPort.onDisconnect.addListener(connect);
}

connect();

// Sends message to background script that an event has fired
function sendMessageToBackground(
  message: LegacyMessageFromContentScript | SatsConnectMessageFromContentScript,
) {
  backgroundPort.postMessage(message);
}

// Process messages received from the extension.
chrome.runtime.onMessage.addListener((message: unknown) => {
  if (v.is(contentScriptWalletEventMessageSchema, message)) {
    window.dispatchEvent(
      new CustomEvent(walletEventName, {
        detail: message.data,
      }),
    );
    return;
  }

  // Default to posting the message to `window` for unrecognized messages. Some
  // functionality, such as RPC response messages, rely on the responses being
  // posted to `window`.
  //
  // Ideally, all message types would be handled explicitly and warnings/errors
  // would be logged when unrecognized messages are received.
  window.postMessage(message, window.location.origin);
});

interface ForwardDomEventToBackgroundArgs {
  payload: string;
  method: LegacyMessageFromContentScript['method'] | SatsConnectMessageFromContentScript['method'];
  urlParam: string;
  path: RequestsRoutes;
}

function forwardDomEventToBackground({ payload, method }: ForwardDomEventToBackgroundArgs) {
  sendMessageToBackground({
    method,
    payload,
    source: MESSAGE_SOURCE,
  });
}

// Listen for a CustomEvent (auth request) coming from the web app
document.addEventListener(DomEventName.authenticationRequest, ((
  event: AuthenticationRequestEvent,
) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.AuthenticationRequest,
    payload: event.detail.authenticationRequest,
    urlParam: 'authRequest',
    method: StacksLegacyMethods.authenticationRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (transaction request) coming from the web app
document.addEventListener(DomEventName.transactionRequest, ((event: TransactionRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.TransactionRequest,
    payload: event.detail.transactionRequest,
    urlParam: 'request',
    method: StacksLegacyMethods.transactionRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (signature request) coming from the web app
document.addEventListener(DomEventName.signatureRequest, ((event: SignatureRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SignatureRequest,
    payload: event.detail.signatureRequest,
    urlParam: 'request',
    method: StacksLegacyMethods.signatureRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (structured data signature request) coming from the web app
document.addEventListener(DomEventName.structuredDataSignatureRequest, ((
  event: SignatureRequestEvent,
) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SignatureRequest,
    payload: event.detail.signatureRequest,
    urlParam: 'request',
    method: StacksLegacyMethods.structuredDataSignatureRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (BTC Address request) coming from the web app
document.addEventListener(DomEventName.getAddressRequest, ((event: GetAddressRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.AddressRequest,
    payload: event.detail.btcAddressRequest,
    urlParam: 'addressRequest',
    method: SatsConnectMethods.getAddressRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (PSBT Signing request) coming from the web app
document.addEventListener(DomEventName.signPsbtRequest, ((event: SignPsbtRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SignBtcTx,
    payload: event.detail.signPsbtRequest,
    urlParam: 'signPsbtRequest',
    method: SatsConnectMethods.signPsbtRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (Batch PSBT Signing request) coming from the web app
document.addEventListener(DomEventName.signBatchPsbtRequest, ((
  event: SignBatchPsbtRequestEvent,
) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SignBatchBtcTx,
    payload: event.detail.signBatchPsbtRequest,
    urlParam: 'signBatchPsbtRequest',
    method: SatsConnectMethods.signBatchPsbtRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (Message Signing request) coming from the web app
document.addEventListener(DomEventName.signMessageRequest, ((event: SignMessageRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SignMessageRequest,
    payload: event.detail.signMessageRequest,
    urlParam: 'signMessageRequest',
    method: SatsConnectMethods.signMessageRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (Send BTC request) coming from the web app
document.addEventListener(DomEventName.sendBtcRequest, ((event: SendBtcRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SendBtcTx,
    payload: event.detail.sendBtcRequest,
    urlParam: 'sendBtcRequest',
    method: SatsConnectMethods.sendBtcRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (Create Text Inscription Request) coming from the web app
document.addEventListener(DomEventName.createInscriptionRequest, ((
  event: CreateInscriptionEvent,
) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.CreateInscription,
    payload: event.detail.createInscriptionRequest,
    urlParam: 'createInscriptionRequest',
    method: SatsConnectMethods.createInscriptionRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (Create Repeat Inscriptions Request) coming from the web app
document.addEventListener(DomEventName.createRepeatInscriptionsRequest, ((
  event: CreateRepeatInscriptionsEvent,
) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.CreateRepeatInscriptions,
    payload: event.detail.createRepeatInscriptionsRequest,
    urlParam: 'createRepeatInscriptionsRequest',
    method: SatsConnectMethods.createRepeatInscriptionsRequest,
  });
}) as EventListener);

document.addEventListener(DomEventName.rpcRequest, (event: any) => {
  sendMessageToBackground({ source: MESSAGE_SOURCE, ...event.detail });
});

// Inject in-page script (Stacks and Bitcoin Providers)
const injectInPageScript = (isPriority) => {
  const inpage = document.createElement('script');
  inpage.src = chrome.runtime.getURL('inpage.js');
  inpage.id = 'xverse-wallet-provider';
  inpage.setAttribute('data-is-priority', isPriority ? 'true' : '');
  document.head.appendChild(inpage);
};

getIsPriorityWallet()
  .then((isPriorityWallet) => {
    injectInPageScript(isPriorityWallet);
  })
  .catch(() => {
    injectInPageScript(false);
  });
