import {
  StacksLegacyMethods,
  type LegacyMessageToContentScript,
  type SatsConnectMessageToContentScript,
} from '@common/types/message-types';
import {
  PAGE_BRIDGE_READY_EVENT,
  PAGE_BRIDGE_WINDOW_PROP,
  isValidLegacyEventData,
  shouldAcceptPageBridgeInit,
} from '@common/utils/pageMessageBridge';

export { isValidLegacyEventData };

type CallableMethods = keyof typeof StacksLegacyMethods;

interface ExtensionResponse {
  source: 'xverse-extension';
  method: CallableMethods;

  [key: string]: any;
}

declare global {
  interface Window {
    [PAGE_BRIDGE_WINDOW_PROP]?: MessagePort;
  }
}

/** Events delivered via the CS MessagePort (not forgeable window.postMessage). */
const trustedWalletMessageEvents = new WeakSet<MessageEvent>();
const trustedListeners = new Set<(event: MessageEvent) => void>();
let bridgeWired = false;

function dispatchTrusted(data: unknown) {
  const synthetic = new MessageEvent('message', {
    data,
    origin: window.location.origin,
    source: window,
  });
  trustedWalletMessageEvents.add(synthetic);
  trustedListeners.forEach((listener) => listener(synthetic));
}

function wirePageBridgePort(port: MessagePort) {
  if (bridgeWired) return;
  bridgeWired = true;
  port.addEventListener('message', (event) => {
    dispatchTrusted(event.data);
  });
  // port may already be started by bootstrap
  try {
    port.start();
  } catch {
    // already started
  }
}

function ensurePageBridge() {
  if (typeof window === 'undefined') return;
  const existing = window[PAGE_BRIDGE_WINDOW_PROP];
  if (existing) {
    wirePageBridgePort(existing);
    return;
  }

  const onInit = (event: MessageEvent) => {
    const ports = event.ports;
    if (
      !shouldAcceptPageBridgeInit({
        alreadyHasPort: !!window[PAGE_BRIDGE_WINDOW_PROP],
        eventSourceIsWindow: event.source === window,
        data: event.data,
        hasPort: !!ports && ports.length > 0,
      })
    ) {
      return;
    }
    const port = ports[0];
    Object.defineProperty(window, PAGE_BRIDGE_WINDOW_PROP, {
      value: port,
      writable: false,
      configurable: false,
    });
    window.removeEventListener('message', onInit);
    wirePageBridgePort(port);
  };

  window.addEventListener('message', onInit);
  window.addEventListener(
    PAGE_BRIDGE_READY_EVENT,
    () => {
      const port = window[PAGE_BRIDGE_WINDOW_PROP];
      if (port) wirePageBridgePort(port);
    },
    { once: true },
  );
}

ensurePageBridge();

export function addTrustedWalletMessageListener(handler: (event: MessageEvent) => void) {
  trustedListeners.add(handler);
}

export function removeTrustedWalletMessageListener(handler: (event: MessageEvent) => void) {
  trustedListeners.delete(handler);
}

export function isTrustedWalletMessageEvent(event: MessageEvent): boolean {
  return trustedWalletMessageEvents.has(event);
}

export const isValidLegacyEvent = (
  event: MessageEvent,
  method: SatsConnectMessageToContentScript['method'] | LegacyMessageToContentScript['method'],
) => {
  // Reject forgeable window.postMessage envelopes — only CS MessagePort delivery counts.
  if (!isTrustedWalletMessageEvent(event)) {
    return false;
  }
  return isValidLegacyEventData(event.data, method);
};

export const callAndReceive = async (
  methodName: CallableMethods | 'getURL',
  opts: any = {},
): Promise<ExtensionResponse> =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Unable to get response from xverse extension'));
    }, 1000);
    const waitForResponse = (event: MessageEvent) => {
      // getURL still uses window.postMessage (CS ↔ page); require same-window source
      // to ignore iframe spoofs. Full MessagePort for this path is a follow-up.
      if (event.source !== window) {
        return;
      }
      if (
        event.data.source === 'xverse-extension' &&
        event.data.method === `${methodName}Response`
      ) {
        clearTimeout(timeout);
        window.removeEventListener('message', waitForResponse);
        resolve(event.data);
      }
    };
    window.addEventListener('message', waitForResponse);
    window.postMessage(
      {
        method: methodName,
        source: 'xverse-app',
        ...opts,
      },
      window.location.origin,
    );
  });
