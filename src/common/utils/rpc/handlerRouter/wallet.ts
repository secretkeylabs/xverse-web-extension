/* eslint-disable import/prefer-default-export */
import {
  connectMethodName,
  connectRequestMessageSchema,
  getAccountMethodName,
  getAccountRequestMessageSchema,
  getCurrentPermissionsMethodName,
  getCurrentPermissionsRequestMessageSchema,
  getWalletTypeMethodName,
  getWalletTypeRequestMessageSchema,
  renouncePermissionsMethodName,
  renouncePermissionsRequestMessageSchema,
  requestPermissionsMethodName,
  requestPermissionsRequestMessageSchema,
} from '@sats-connect/core';
import type { Handler } from '.';
import { requirePermissions, validateMessageSchema } from '../messageMiddlewares';
import { handleConnect } from '../wallet/connect';
import { handleGetAccount } from '../wallet/getAccount';
import { handleGetPermissions } from '../wallet/getCurrentPermissions';
import { handleGetWalletType } from '../wallet/getWalletType';
import { handleRenouncePermissions } from '../wallet/renouncePermissions';
import { handleRequestPermissions } from '../wallet/requestPermissions';
import { getCurrentAccountResourceId } from './common';

export const router: Record<string, Handler> = {
  [connectMethodName]: validateMessageSchema(connectRequestMessageSchema, handleConnect),
  [requestPermissionsMethodName]: validateMessageSchema(
    requestPermissionsRequestMessageSchema,
    handleRequestPermissions,
  ),
  [renouncePermissionsMethodName]: validateMessageSchema(
    renouncePermissionsRequestMessageSchema,
    handleRenouncePermissions,
  ),
  [getWalletTypeMethodName]: requirePermissions(
    [
      () => ({
        type: 'account',
        resourceId: getCurrentAccountResourceId(),
        actions: {
          read: true,
        },
      }),
    ],
    validateMessageSchema(getWalletTypeRequestMessageSchema, handleGetWalletType),
  ),
  [getCurrentPermissionsMethodName]: requirePermissions(
    [
      () => ({
        type: 'account',
        resourceId: getCurrentAccountResourceId(),
        actions: {
          read: true,
        },
      }),
    ],
    validateMessageSchema(getCurrentPermissionsRequestMessageSchema, handleGetPermissions),
  ),
  [getAccountMethodName]: requirePermissions(
    [
      () => ({
        type: 'account',
        resourceId: getCurrentAccountResourceId(),
        actions: {
          read: true,
        },
      }),
    ],
    validateMessageSchema(getAccountRequestMessageSchema, handleGetAccount),
  ),
};
