import type { StacksTransaction } from '@stacks/transactions';

export type TransactionInfoProps = {
  transaction: StacksTransaction;
  onEditNonce?: () => void;
  onEditFee?: (transaction: StacksTransaction) => void;
};
