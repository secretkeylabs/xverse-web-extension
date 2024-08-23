import type { RpcId } from '@sats-connect/core';

export type BaseArgs = {
  tabId: NonNullable<chrome.tabs.Tab['id']>;
  messageId: RpcId;
};
