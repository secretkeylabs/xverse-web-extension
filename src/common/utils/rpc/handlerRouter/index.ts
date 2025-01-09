/* eslint-disable import/prefer-default-export */
import type { RpcRequestMessage } from '@sats-connect/core';
import { router as bitcoinRouter } from './bitcoin';
import { router as ordinalsRouter } from './ordinals';
import { router as runesRouter } from './runes';
import { router as stacksRouter } from './stacks';
import { router as walletRouter } from './wallet';

export type Handler = (message: RpcRequestMessage, port: chrome.runtime.Port) => Promise<void>;

export const router: Record<string, Handler> = {
  ...walletRouter,
  ...bitcoinRouter,
  ...stacksRouter,
  ...runesRouter,
  ...ordinalsRouter,
};
