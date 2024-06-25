/* eslint-disable import/prefer-default-export */
import { Return } from '@sats-connect/core';
import { makeRpcSuccessResponse, sendRpcResponse } from '../helpers';
import { BaseArgs } from './types';

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
