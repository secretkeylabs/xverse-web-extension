import type { ConnectResult, Return } from '@sats-connect/core';
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

type GetPermissionsSuccessArgs = BaseArgs & {
  result: Return<'wallet_getCurrentPermissions'>;
};
export function sendGetCurrentPermissionsSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: GetPermissionsSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type GetAccountSuccessArgs = BaseArgs & {
  result: Return<'wallet_getAccount'>;
};
export function sendGetAccountSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: GetAccountSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type ConnectSuccessArgs = BaseArgs & {
  result: Return<'wallet_connect'>;
};
export function sendConnectSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: ConnectSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type GetNetworkSuccessArgs = BaseArgs & {
  result: Return<'wallet_getNetwork'>;
};
export function sendGetNetworkSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: GetNetworkSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

export function sendChangeNetworkSuccessResponseMessage({ tabId, messageId }: BaseArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, null));
}
