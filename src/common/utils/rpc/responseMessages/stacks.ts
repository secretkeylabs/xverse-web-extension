import type { Return } from '@sats-connect/core';
import { makeRpcSuccessResponse, sendRpcResponse } from '../helpers';
import type { BaseArgs } from './types';

type SignTransactionSuccessArgs = BaseArgs & {
  result: Return<'stx_signTransaction'>;
};
export function sendSignTransactionSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: SignTransactionSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type CallContractSuccessArgs = BaseArgs & {
  result: Return<'stx_callContract'>;
};
export function sendCallContractSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: CallContractSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type StxTransferSuccessArgs = BaseArgs & {
  result: Return<'stx_transferStx'>;
};
export function sendStxTransferSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: StxTransferSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type GetAccountsSuccess = BaseArgs & {
  result: Return<'stx_getAccounts'>;
};
export function sendGetAccountsSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: GetAccountsSuccess) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type GetAddressesSuccess = BaseArgs & {
  result: Return<'stx_getAddresses'>;
};
export function sendGetAddressesSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: GetAddressesSuccess) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}

type DeployContractSuccessArgs = BaseArgs & {
  result: Return<'stx_deployContract'>;
};
export function sendDeployContractSuccessResponseMessage({
  tabId,
  messageId,
  result,
}: DeployContractSuccessArgs) {
  sendRpcResponse(tabId, makeRpcSuccessResponse(messageId, result));
}
