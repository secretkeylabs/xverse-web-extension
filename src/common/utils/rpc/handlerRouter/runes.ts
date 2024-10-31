/* eslint-disable import/prefer-default-export */
import {
  runesEtchMethodName,
  runesEtchRequestMessageSchema,
  runesGetBalanceMethodName,
  runesGetBalanceRequestMessageSchema,
  runesMintMethodName,
  runesMintRequestMessageSchema,
  runesTransferMethodName,
  runesTransferRequestMessageSchema,
} from '@sats-connect/core';
import type { Handler } from '.';
import { requirePermissions, validateMessageSchema } from '../messageMiddlewares';
import handleEtchRune from '../runes/etch';
import handleGetRunesBalance from '../runes/getBalance';
import handleMintRune from '../runes/mint';
import handleTransferRunes from '../runes/transfer';
import { getCurrentAccountResourceId } from './common';

export const router: Record<string, Handler> = {
  [runesGetBalanceMethodName]: requirePermissions(
    [
      () => ({
        type: 'account',
        resourceId: getCurrentAccountResourceId(),
        actions: {
          read: true,
        },
      }),
    ],
    validateMessageSchema(runesGetBalanceRequestMessageSchema, handleGetRunesBalance),
  ),
  [runesMintMethodName]: validateMessageSchema(runesMintRequestMessageSchema, handleMintRune),
  [runesEtchMethodName]: validateMessageSchema(runesEtchRequestMessageSchema, handleEtchRune),
  [runesTransferMethodName]: validateMessageSchema(
    runesTransferRequestMessageSchema,
    handleTransferRunes,
  ),
};
