import type { StacksTransactionWire } from '@stacks/transactions';

export type TransactionInfoProps = {
  transaction: StacksTransactionWire;
  onEditNonce?: () => void;
  onEditFee?: (transaction: StacksTransactionWire) => void;
};
