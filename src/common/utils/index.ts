import { createUnsecuredToken } from 'jsontokens';
import { stringify } from 'superjson';

export function getTabIdFromPort(port: chrome.runtime.Port) {
  const tabId = port.sender?.tab?.id;

  if (!tabId) {
    throw new Error('Could not determine tab id from port.', { cause: port });
  }

  return tabId;
}

export function getOriginFromPort(port: chrome.runtime.Port) {
  const origin = port.sender?.url ? new URL(port.sender.url).origin : port.sender?.origin;

  if (!origin) {
    throw new Error('Could not determine origin from port.', { cause: port });
  }

  return origin;
}

export function stringifyData(data: unknown) {
  return createUnsecuredToken(stringify(data));
}
