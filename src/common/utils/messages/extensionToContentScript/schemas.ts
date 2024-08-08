import { rpcResponseMessageSchema, walletEventSchema } from '@sats-connect/core';
import * as v from 'valibot';

export const contentScriptWalletEventMessageName = 'wallet-event';
export const contentScriptWalletEventMessageSchema = v.object({
  type: v.literal(contentScriptWalletEventMessageName),
  data: walletEventSchema,
});
export type ContentScriptWalletEventMessage = v.InferOutput<
  typeof contentScriptWalletEventMessageSchema
>;

export const contentScriptRrpcResponseMessageName = 'rpc-response';
export const contentScriptRpcResponseMessageSchema = v.object({
  type: v.literal(contentScriptRrpcResponseMessageName),
  data: rpcResponseMessageSchema,
});
export type ContentScriptRpcResponseMessage = v.InferOutput<
  typeof contentScriptRpcResponseMessageSchema
>;

export const contentScriptMessageSchema = v.variant('type', [
  contentScriptWalletEventMessageSchema,
  contentScriptRpcResponseMessageSchema,
]);
export type ContentScriptMessage = v.InferOutput<typeof contentScriptMessageSchema>;
