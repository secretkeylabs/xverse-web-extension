import { Return } from '@sats-connect/core';
import { makeRpcSuccessResponse, sendRpcResponse } from '../helpers';
import { BaseArgs } from './types';

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
