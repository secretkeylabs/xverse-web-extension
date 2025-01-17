import type { StacksTransactionWire } from '@stacks/transactions';

export type Props = {
  transaction: StacksTransactionWire;
  onEdit?: (transaction: StacksTransactionWire) => void;
};
