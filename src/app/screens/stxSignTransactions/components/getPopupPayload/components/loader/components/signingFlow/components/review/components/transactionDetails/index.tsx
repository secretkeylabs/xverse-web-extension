import { transactionTypeToDetailsComponentMap } from './transactionTypeToComponentMap';
import type { TransactionInfoProps } from './types';

export function TransactionDetails(props: TransactionInfoProps) {
  const { transaction } = props;
  const Component = transactionTypeToDetailsComponentMap[transaction.payload.payloadType];
  return <Component {...props} />;
}
