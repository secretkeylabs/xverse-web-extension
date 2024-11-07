/* eslint-disable import/prefer-default-export */
import {
  stxCallContractMethodName,
  stxCallContractRequestMessageSchema,
  stxDeployContractMethodName,
  stxDeployContractRequestMessageSchema,
  stxGetAccountsMethodName,
  stxGetAccountsRequestMessageSchema,
  stxGetAddressesMethodName,
  stxGetAddressesRequestMessageSchema,
  stxSignMessageMethodName,
  stxSignMessageRequestMessageSchema,
  stxSignStructuredMessageMethodName,
  stxSignStructuredMessageRequestMessageSchema,
  stxSignTransactionMethodName,
  stxSignTransactionRequestMessageSchema,
  stxTransferStxMethodName,
  stxTransferStxRequestMessageSchema,
} from '@sats-connect/core';
import type { Handler } from '.';
import { requirePermissions, validateMessageSchema } from '../messageMiddlewares';
import callContract from '../stx/callContract';
import deployContract from '../stx/deployContract';
import handleGetStxAccounts from '../stx/getAccounts';
import handleGetStxAddresses from '../stx/getAddresses';
import handleStacksSignMessage from '../stx/signMessage';
import handleStacksSignStructuredMessage from '../stx/signStructuredMessage';
import { signTransaction } from '../stx/signTransaction';
import transferStx from '../stx/transferStx';
import { getCurrentAccountResourceId } from './common';

export const router: Record<string, Handler> = {
  [stxCallContractMethodName]: validateMessageSchema(
    stxCallContractRequestMessageSchema,
    callContract,
  ),
  [stxDeployContractMethodName]: validateMessageSchema(
    stxDeployContractRequestMessageSchema,
    deployContract,
  ),
  [stxGetAccountsMethodName]: requirePermissions(
    [
      () => ({
        type: 'account',
        resourceId: getCurrentAccountResourceId(),
        actions: {
          read: true,
        },
      }),
    ],
    validateMessageSchema(stxGetAccountsRequestMessageSchema, handleGetStxAccounts),
  ),
  [stxGetAddressesMethodName]: requirePermissions(
    [
      () => ({
        type: 'account',
        resourceId: getCurrentAccountResourceId(),
        actions: {
          read: true,
        },
      }),
    ],
    validateMessageSchema(stxGetAddressesRequestMessageSchema, handleGetStxAddresses),
  ),
  [stxSignTransactionMethodName]: validateMessageSchema(
    stxSignTransactionRequestMessageSchema,
    signTransaction,
  ),
  [stxTransferStxMethodName]: validateMessageSchema(
    stxTransferStxRequestMessageSchema,
    transferStx,
  ),
  [stxSignMessageMethodName]: validateMessageSchema(
    stxSignMessageRequestMessageSchema,
    handleStacksSignMessage,
  ),
  [stxSignStructuredMessageMethodName]: validateMessageSchema(
    stxSignStructuredMessageRequestMessageSchema,
    handleStacksSignStructuredMessage,
  ),
};
