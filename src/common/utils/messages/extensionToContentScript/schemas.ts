import { rpcResponseMessageSchema, walletEventSchema } from '@sats-connect/core';
import * as v from 'valibot';

export const contentScriptWalletEventMessageName = 'wallet-event';
export const contentScriptWalletEventMessageSchema = v.object({
  type: v.literal(contentScriptWalletEventMessageName),
  data: walletEventSchema,
});
/**
 * @public
 */
export type ContentScriptWalletEventMessage = v.InferOutput<
  typeof contentScriptWalletEventMessageSchema
>;

/**
 * @public
 */
export const contentScriptRrpcResponseMessageName = 'rpc-response';
/**
 * @public
 */
export const contentScriptRpcResponseMessageSchema = v.object({
  type: v.literal(contentScriptRrpcResponseMessageName),
  data: rpcResponseMessageSchema,
});
/**
 * @public
 */
export type ContentScriptRpcResponseMessage = v.InferOutput<
  typeof contentScriptRpcResponseMessageSchema
>;

/**
 * @public
 */
export const contentScriptMessageSchema = v.variant('type', [
  contentScriptWalletEventMessageSchema,
  contentScriptRpcResponseMessageSchema,
]);
export type ContentScriptMessage = v.InferOutput<typeof contentScriptMessageSchema>;
