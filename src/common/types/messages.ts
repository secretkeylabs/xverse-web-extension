import { Account } from '@secretkeylabs/xverse-core';
import { ExtensionMethods, InternalMethods, Message } from './message-types';

/**
 * Popup <-> Background Script
 */
type BackgroundMessage<Msg extends ExtensionMethods, Payload = undefined> = Omit<
  Message<Msg, Payload>,
  'source'
>;

type OriginatingTabClosed = BackgroundMessage<
  InternalMethods.OriginatingTabClosed,
  { tabId: number }
>;

type ChangeActiveAccount = BackgroundMessage<
  InternalMethods.ChangeActiveAccount,
  { account: Account }
>;

type RequestActiveAccount = BackgroundMessage<InternalMethods.RequestActiveAccount>;

export type BackgroundMessages = OriginatingTabClosed | ChangeActiveAccount | RequestActiveAccount;

export function sendMessage(message: BackgroundMessages) {
  return chrome.runtime.sendMessage(message);
}
