import type { AccountWithDetails } from '@common/utils/getSelectedAccount';
import { type StxSignTransactionsRequestMessage } from '@sats-connect/core';
import {
  safePromise,
  signTransaction,
  StacksMainnet,
  StacksTestnet,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction, type StacksTransaction } from '@stacks/transactions';

export function getTransactionsFromRpcMessage(data: StxSignTransactionsRequestMessage) {
  const transactionsData = data.params.transactions;
  return transactionsData.map((transaction) => deserializeTransaction(transaction));
}

type SignTransactionsArgs = {
  seed: string;
  transactions: StacksTransaction[];
  network: StacksMainnet | StacksTestnet;
  accountId: AccountWithDetails['id'];
};
export async function signTransactions({
  seed,
  transactions,
  network,
  accountId,
}: SignTransactionsArgs) {
  const [signTransactionError, signedTransactions] = await safePromise(
    Promise.all(
      transactions.map((transaction) => signTransaction(transaction, seed, accountId, network)),
    ),
  );

  if (signTransactionError)
    throw new Error('Failed to sign transaction', { cause: signTransactionError });

  return signedTransactions;
}

export function bigIntReplacer(_key: unknown, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value;
}
