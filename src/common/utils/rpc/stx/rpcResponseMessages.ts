/* eslint-disable import/prefer-default-export */
import { Return, RpcErrorCode, RpcId } from 'sats-connect';
import { ZodError } from 'zod';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '../helpers';

type BaseArgs = {
  tabId: NonNullable<chrome.tabs.Tab['id']>;
  messageId: RpcId;
};

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
  error: ZodError;
};
export function sendInvalidParametersMessage({
  tabId,
  messageId,
  error,
}: InvalidParametersMessageArgs) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.INVALID_PARAMS,
      message: `Invalid parameters. ${error.toString()}`,
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

export function sendInternalErrorMessage({ tabId, messageId }: BaseArgs) {
  sendRpcResponse(
    tabId,
    makeRPCError(messageId, {
      code: RpcErrorCode.INTERNAL_ERROR,
      message: 'Internal error.',
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
