/* eslint-disable import/prefer-default-export */
import {
  getAccountsMethodName,
  getAccountsRequestMessageSchema,
  getAddressesMethodName,
  getAddressesRequestMessageSchema,
  getBalanceMethodName,
  getBalanceRequestMessageSchema,
  getInfoMethodName,
  getInfoRequestMessageSchema,
  sendTransferMethodName,
  sendTransferRequestMessageSchema,
  signMessageMethodName,
  signMessageRequestMessageSchema,
  signPsbtMethodName,
  signPsbtRequestMessageSchema,
} from '@sats-connect/core';
import type { Handler } from '.';
import {
  handleGetAccounts,
  handleGetAddresses,
  handleSendTransfer,
  handleSignMessage,
  handleSignPsbt,
} from '../btc';
import { handleGetBalance } from '../btc/getBalance';
import handleGetInfo from '../getInfo';
import { requirePermissions, validateMessageSchema } from '../messageMiddlewares';
import { getCurrentAccountResourceId } from './common';

export const router: Record<string, Handler> = {
  [getBalanceMethodName]: requirePermissions(
    [
      () => ({
        type: 'account',
        resourceId: getCurrentAccountResourceId(),
        actions: {
          read: true,
        },
      }),
    ],
    validateMessageSchema(getBalanceRequestMessageSchema, handleGetBalance),
  ),
  [getInfoMethodName]: validateMessageSchema(getInfoRequestMessageSchema, handleGetInfo),
  [getAddressesMethodName]: requirePermissions(
    [
      () => ({
        type: 'account',
        resourceId: getCurrentAccountResourceId(),
        actions: {
          read: true,
        },
      }),
    ],
    validateMessageSchema(getAddressesRequestMessageSchema, handleGetAddresses),
  ),
  [getAccountsMethodName]: validateMessageSchema(
    getAccountsRequestMessageSchema,
    handleGetAccounts,
  ),
  [signMessageMethodName]: validateMessageSchema(
    signMessageRequestMessageSchema,
    handleSignMessage,
  ),
  [sendTransferMethodName]: validateMessageSchema(
    sendTransferRequestMessageSchema,
    handleSendTransfer,
  ),
  [signPsbtMethodName]: validateMessageSchema(signPsbtRequestMessageSchema, handleSignPsbt),
};
