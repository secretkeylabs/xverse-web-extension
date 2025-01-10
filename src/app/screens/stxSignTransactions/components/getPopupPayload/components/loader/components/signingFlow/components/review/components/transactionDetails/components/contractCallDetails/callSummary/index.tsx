import { isContractCallPayload, StacksTransaction } from '@stacks/transactions';
import { TransactionDetailsLayout } from './callSummaryLoader';

type CallSummaryProps = {
  /**
   * Expectes a contract call transaction.
   */
  transaction: StacksTransaction;
};

function TransactionDetailsCheckPayloadType({ transaction }: CallSummaryProps) {
  const { payload } = transaction;
  if (!isContractCallPayload(payload)) {
    throw new Error('Expected a contract call payload', { cause: payload });
  }

  return <TransactionDetailsLayout payload={payload} transaction={transaction} />;
}

export function TransactionDetails({ transaction }: CallSummaryProps) {
  return <TransactionDetailsCheckPayloadType transaction={transaction} />;
}
