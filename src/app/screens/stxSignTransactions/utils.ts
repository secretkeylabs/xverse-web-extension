import type { AccountWithDetails } from '@common/utils/getSelectedAccount';
import { type StxSignTransactionsRequestMessage } from '@sats-connect/core';
import type { HDKey } from '@scure/bip32';
import {
  safePromise,
  signTransaction,
  type DerivationType,
  type StacksNetwork,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction, type StacksTransactionWire } from '@stacks/transactions';

export function getTransactionsFromRpcMessage(data: StxSignTransactionsRequestMessage) {
  const transactionsData = data.params.transactions;
  return transactionsData.map((transaction) => deserializeTransaction(transaction));
}

type SignTransactionsArgs = {
  rootNode: HDKey;
  derivationType: DerivationType;
  transactions: StacksTransactionWire[];
  network: StacksNetwork;
  accountId: AccountWithDetails['id'];
};
export async function signTransactions({
  rootNode,
  derivationType,
  transactions,
  network,
  accountId,
}: SignTransactionsArgs) {
  const [signTransactionError, signedTransactions] = await safePromise(
    Promise.all(
      transactions.map((transaction) =>
        signTransaction(transaction, rootNode, derivationType, accountId, network),
      ),
    ),
  );

  if (signTransactionError)
    throw new Error('Failed to sign transaction', { cause: signTransactionError });

  return signedTransactions;
}

export function bigIntReplacer(_key: unknown, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value;
}
