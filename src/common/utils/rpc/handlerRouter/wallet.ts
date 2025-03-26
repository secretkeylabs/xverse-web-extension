/* eslint-disable import/prefer-default-export */
import {
  changeNetworkMethodName,
  changeNetworkRequestMessageSchema,
  connectMethodName,
  connectRequestMessageSchema,
  disconnectMethodName,
  disconnectRequestMessageSchema,
  getAccountMethodName,
  getAccountRequestMessageSchema,
  getCurrentPermissionsMethodName,
  getCurrentPermissionsRequestMessageSchema,
  getNetworkMethodName,
  getNetworkRequestMessageSchema,
  getWalletTypeMethodName,
  getWalletTypeRequestMessageSchema,
  renouncePermissionsMethodName,
  renouncePermissionsRequestMessageSchema,
  requestPermissionsMethodName,
  requestPermissionsRequestMessageSchema,
} from '@sats-connect/core';
import type { Handler } from '.';
import { requirePermissions, validateMessageSchema } from '../messageMiddlewares';
import { handleChangeNetwork } from '../wallet/changeNetwork';
import { handleConnect } from '../wallet/connect';
import { handleDisconnect } from '../wallet/disconnect';
import { handleGetAccount } from '../wallet/getAccount';
import { handleGetPermissions } from '../wallet/getCurrentPermissions';
import { handleGetNetwork } from '../wallet/getNetwork';
import { handleGetWalletType } from '../wallet/getWalletType';
import { handleRenouncePermissions } from '../wallet/renouncePermissions';
import { handleRequestPermissions } from '../wallet/requestPermissions';
import { getCurrentAccountResourceId } from './common';

export const router: Record<string, Handler> = {
  [connectMethodName]: validateMessageSchema(connectRequestMessageSchema, handleConnect),
  [disconnectMethodName]: validateMessageSchema(disconnectRequestMessageSchema, handleDisconnect),
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
  [getNetworkMethodName]: requirePermissions(
    [{ type: 'wallet', resourceId: 'wallet', actions: { readNetwork: true } }],
    validateMessageSchema(getNetworkRequestMessageSchema, handleGetNetwork),
  ),
  [changeNetworkMethodName]: requirePermissions(
    [{ type: 'wallet', resourceId: 'wallet', actions: { readNetwork: true } }],
    validateMessageSchema(changeNetworkRequestMessageSchema, handleChangeNetwork),
  ),
};
