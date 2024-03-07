/* eslint-disable import/prefer-default-export */
export function getTabIdFromPort(port: chrome.runtime.Port) {
  return port.sender?.tab?.id ?? 0;
}
