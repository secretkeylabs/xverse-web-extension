import type { StacksRecipient } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';

export type ConfirmStxTransactionState = {
  recipients: StacksRecipient[];
  unsignedTx: Buffer;
  fee: BigNumber;
  tabId?: number;
  messageId?: string;
  rpcMethod?: string;
};
