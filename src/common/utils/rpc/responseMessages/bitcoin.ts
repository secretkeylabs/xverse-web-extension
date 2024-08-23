/* eslint-disable import/prefer-default-export */
/* eslint-disable import/prefer-default-export */
import type { Return } from '@sats-connect/core';
import { makeRpcSuccessResponse, sendRpcResponse } from '../helpers';
import type { BaseArgs } from './types';

type GetBalanceSuccess = BaseArgs & {
  result: Return<'getBalance'>;
};
export function sendGetBalanceSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: GetBalanceSuccess) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type GetAddressesSuccess = BaseArgs & {
  result: Return<'getAddresses'>;
};
export function sendGetAddressesSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: GetAddressesSuccess) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type SignMessageSuccess = BaseArgs & {
  result: Return<'signMessage'>;
};
export function sendSignMessageSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: SignMessageSuccess) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}
