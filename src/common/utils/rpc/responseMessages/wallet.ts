import type { Return } from '@sats-connect/core';
import { makeRpcSuccessResponse, sendRpcResponse } from '../helpers';
import type { BaseArgs } from './types';

type RequestPermissionsSuccessArgs = BaseArgs & {
  result: Return<'wallet_requestPermissions'>;
};
export function sendRequestPermissionsSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: RequestPermissionsSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type RenouncePermissionsSuccessArgs = BaseArgs & {
  result: Return<'wallet_renouncePermissions'>;
};
export function sendRenouncePermissionsSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: RenouncePermissionsSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type GetWalletTypeSuccessArgs = BaseArgs & {
  result: Return<'wallet_getWalletType'>;
};
export function sendGetWalletTypeSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: GetWalletTypeSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}
