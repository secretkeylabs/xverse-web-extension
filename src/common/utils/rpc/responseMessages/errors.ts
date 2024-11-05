/* eslint-disable import/prefer-default-export */
import { RpcErrorCode } from '@sats-connect/core';
import { makeRPCError, sendRpcResponse } from '../helpers';
import type { BaseArgs } from './types';

export function sendMissingParametersMessage({ tabId, messageId }: BaseArgs) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.INVALID_REQUEST,
      message: 'Missing parameters.',
    }),
  );
}

type InvalidParametersMessageArgs = BaseArgs & {
  error?: unknown;
};
export function sendInvalidParametersResponseMessage({
  tabId,
  messageId,
  error,
}: InvalidParametersMessageArgs) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.INVALID_PARAMS,
      message: `Invalid parameters.`,
      data: { error },
    }),
  );
}

export function sendInvalidStacksTransactionMessage({ tabId, messageId }: BaseArgs) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.INVALID_PARAMS,
      message: 'Invalid Stacks transaction.',
    }),
  );
}

export function sendNetworkMismatchMessage({ tabId, messageId }: BaseArgs) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.INVALID_REQUEST,
      message: 'Network mismatch.',
    }),
  );
}

export function sendAddressMismatchMessage({ tabId, messageId }: BaseArgs) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.INVALID_REQUEST,
      message: 'Address mismatch.',
    }),
  );
}

export function sendInternalErrorMessage({
  tabId,
  messageId,
  message,
}: BaseArgs & { message?: string }) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.INTERNAL_ERROR,
      message: message ?? 'Internal error.',
    }),
  );
}

export function sendUserRejectionMessage({ tabId, messageId }: BaseArgs) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'User rejected the request.',
    }),
  );
}

export function sendMissingFunctionArgumentsMessage({ tabId, messageId }: BaseArgs) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.INVALID_REQUEST,
      message: 'Missing function arguments.',
    }),
  );
}
export function sendAccessDeniedResponseMessage({ tabId, messageId }: BaseArgs) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.ACCESS_DENIED,
      message: 'Access denied.',
    }),
  );
}
