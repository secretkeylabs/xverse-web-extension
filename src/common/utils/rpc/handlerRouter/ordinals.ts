/* eslint-disable import/prefer-default-export */

import {
  getInscriptionsMethodName,
  getInscriptionsRequestMessageSchema,
  sendInscriptionsMethodName,
  sendInscriptionsRequestMessageSchema,
} from '@sats-connect/core';
import type { Handler } from '.';
import { requirePermissions, validateMessageSchema } from '../messageMiddlewares';
import handleGetInscriptions from '../ordinals/getInscriptions';
import handleSendInscriptions from '../ordinals/sendInscriptions';
import { getCurrentAccountResourceId } from './common';

export const router: Record<string, Handler> = {
  [getInscriptionsMethodName]: requirePermissions(
    [
      () => ({
        type: 'account',
        resourceId: getCurrentAccountResourceId(),
        actions: {
          read: true,
        },
      }),
    ],
    validateMessageSchema(getInscriptionsRequestMessageSchema, handleGetInscriptions),
  ),
  [sendInscriptionsMethodName]: validateMessageSchema(
    sendInscriptionsRequestMessageSchema,
    handleSendInscriptions,
  ),
};
