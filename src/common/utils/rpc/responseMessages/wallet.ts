/* eslint-disable import/prefer-default-export */
import { Return } from '@sats-connect/core';
import { makeRpcSuccessResponse, sendRpcResponse } from '../helpers';
import { BaseArgs } from './types';

type RequestPermissionsSuccessArgs = BaseArgs & {
  result: Return<'wallet_connect'>;
};
export function sendRequestPermissionsSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: RequestPermissionsSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}
