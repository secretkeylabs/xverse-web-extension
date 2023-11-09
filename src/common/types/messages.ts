import { ExtensionMethods, InternalMethods, Message } from './message-types';

/**
 * Popup <-> Background Script
 */
type BackgroundMessage<Msg extends ExtensionMethods, Payload = undefined> = Omit<
  Message<Msg, Payload>,
  'source'
>;

type ShareInMemoryKeyToBackground = BackgroundMessage<
  InternalMethods.ShareInMemoryKeyToBackground,
  { secretKey: string }
>;

type RequestInMemoryKeys = BackgroundMessage<InternalMethods.RequestInMemoryKeys>;

type RemoveInMemoryKeys = BackgroundMessage<InternalMethods.RemoveInMemoryKeys>;

type OriginatingTabClosed = BackgroundMessage<
  InternalMethods.OriginatingTabClosed,
  { tabId: number }
>;

export type BackgroundMessages =
  | ShareInMemoryKeyToBackground
  | RequestInMemoryKeys
  | RemoveInMemoryKeys
  | OriginatingTabClosed;

export function sendMessage(message: BackgroundMessages) {
  return chrome.runtime.sendMessage(message);
}
