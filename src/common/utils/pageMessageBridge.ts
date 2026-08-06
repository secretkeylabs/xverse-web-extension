/**
 * Content-script ↔ inpage MessagePort bridge (PR7 / M-02).
 *
 * `window.postMessage({ source: 'xverse-wallet', ... })` is forgeable by any
 * same-origin page script. A transferred MessagePort cannot be impersonated
 * once established at document_start.
 */

export const PAGE_BRIDGE_INIT_SOURCE = 'xverse-extension-bridge';
export const PAGE_BRIDGE_INIT_METHOD = 'initPageBridge';
export const PAGE_BRIDGE_WINDOW_PROP = '__XVERSE_PAGE_BRIDGE__';
export const PAGE_BRIDGE_READY_EVENT = 'xverse-page-bridge-ready';

export type PageBridgeInitMessage = {
  source: typeof PAGE_BRIDGE_INIT_SOURCE;
  method: typeof PAGE_BRIDGE_INIT_METHOD;
};

export function isPageBridgeInitMessage(data: unknown): data is PageBridgeInitMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as PageBridgeInitMessage).source === PAGE_BRIDGE_INIT_SOURCE &&
    (data as PageBridgeInitMessage).method === PAGE_BRIDGE_INIT_METHOD
  );
}

/** Pure gate for accepting the first bridge transfer (unit-tested). */
export function shouldAcceptPageBridgeInit(args: {
  alreadyHasPort: boolean;
  eventSourceIsWindow: boolean;
  data: unknown;
  hasPort: boolean;
}): boolean {
  if (args.alreadyHasPort) return false;
  if (!args.eventSourceIsWindow) return false;
  if (!args.hasPort) return false;
  return isPageBridgeInitMessage(args.data);
}

/** Payload shape for legacy responses (channel authenticity is separate). */
export function isValidLegacyEventData(data: unknown, method: string): boolean {
  if (typeof data !== 'object' || data === null) return false;
  const envelope = data as { source?: unknown; method?: unknown; payload?: unknown };
  return envelope.source === 'xverse-wallet' && envelope.method === method && !!envelope.payload;
}

/**
 * Inline bootstrap installed by the content script before transferring the port.
 * Keeps the first port on window under a non-writable property.
 */
export function buildPageBridgeBootstrapScript(): string {
  // Keep this string free of TS/imports — it runs as page JS.
  return `(!function(){var S=${JSON.stringify(PAGE_BRIDGE_INIT_SOURCE)},M=${JSON.stringify(
    PAGE_BRIDGE_INIT_METHOD,
  )},P=${JSON.stringify(PAGE_BRIDGE_WINDOW_PROP)},R=${JSON.stringify(
    PAGE_BRIDGE_READY_EVENT,
  )};function h(e){if(e.source!==window)return;var d=e.data;if(!d||d.source!==S||d.method!==M||!e.ports||!e.ports[0])return;if(window[P])return;var p=e.ports[0];p.start();Object.defineProperty(window,P,{value:p,writable:false,configurable:false});window.dispatchEvent(new CustomEvent(R));window.removeEventListener("message",h)}window.addEventListener("message",h)})();`;
}
