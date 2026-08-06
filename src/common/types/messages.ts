import type { ExtensionMethods, InternalMethods, Message } from './message-types';
import type { ApprovalRecord } from '../utils/approvalRequestStore';

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

type GetApprovalRequest = BackgroundMessage<
  InternalMethods.GetApprovalRequest,
  { requestId: string }
>;

type DeleteApprovalRequest = BackgroundMessage<
  InternalMethods.DeleteApprovalRequest,
  { requestId: string }
>;

export type BackgroundMessages = OriginatingTabClosed | GetApprovalRequest | DeleteApprovalRequest;

export type GetApprovalRequestResponse =
  | { ok: true; record: ApprovalRecord }
  | { ok: false; error: string };

export function sendMessage(message: BackgroundMessages) {
  return chrome.runtime.sendMessage(message);
}
