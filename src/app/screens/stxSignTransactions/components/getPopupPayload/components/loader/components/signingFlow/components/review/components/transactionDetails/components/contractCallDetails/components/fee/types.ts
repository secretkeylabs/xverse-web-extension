import type { StacksTransaction } from '@stacks/transactions';

export type Props = {
  transaction: StacksTransaction;
  onEdit?: (transaction: StacksTransaction) => void;
};
