import type { StacksRecipient } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';

export type LedgerTransactionType = 'BTC' | 'STX' | 'ORDINALS' | 'BRC-20';

type ConfirmLedgerTransactionState = {
  type: LedgerTransactionType;
  fee: BigNumber;
};

export type ConfirmStxTransactionState = ConfirmLedgerTransactionState & {
  recipients: StacksRecipient[];
  unsignedTx: Buffer;
};
