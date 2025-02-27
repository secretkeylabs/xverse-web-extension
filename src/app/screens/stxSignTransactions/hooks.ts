import type { AccountWithDetails } from '@common/utils/getSelectedAccount';
import { sendSignTransactionsSuccessResponseMessage } from '@common/utils/rpc/responseMessages/stacks';
import useNetworkSelector from '@hooks/useNetwork';
import useVault from '@hooks/useVault';
import type { StxSignTransactionsRequestMessage } from '@sats-connect/core';
import {
  estimateStacksTransactionWithFallback,
  safePromise,
  type StacksNetwork,
  type WalletId,
} from '@secretkeylabs/xverse-core';
import { type StacksTransactionWire } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { bigIntReplacer, getTransactionsFromRpcMessage, signTransactions } from './utils';

type UseSignTransactionsSoftwareArgs = {
  account: AccountWithDetails;
  network: StacksNetwork;
  transactions: StacksTransactionWire[];
  walletId: WalletId | undefined;
};
type CallbackArgs = {
  onError: (e: unknown) => void;
  onSuccess: (transactions: StacksTransactionWire[]) => Promise<void> | void;
};
export function useSignTransactionsSoftware(args: UseSignTransactionsSoftwareArgs) {
  const { account, network, transactions, walletId } = args;

  const vault = useVault();

  const signTransactionsSoftware = useCallback(
    async ({ onError, onSuccess }: CallbackArgs) => {
      if (!walletId) return onError(new Error('Wallet ID is required for software accounts'));

      const [getRootNodeError, rootNodeData] = await safePromise(
        vault.SeedVault.getWalletRootNode(walletId),
      );

      if (getRootNodeError) return onError(getRootNodeError);

      const [error, signedTransactions] = await safePromise(
        signTransactions({
          accountId: account.id,
          network,
          rootNode: rootNodeData.rootNode,
          derivationType: rootNodeData.derivationType,
          transactions,
        }),
      );

      if (error) return onError(error);

      onSuccess(signedTransactions);
    },
    [account.id, vault, network, transactions],
  );

  return useMemo(() => ({ signTransactionsSoftware }), [signTransactionsSoftware]);
}

export function useGetTransactionsFromRpcMessage() {
  return useCallback(
    (data: StxSignTransactionsRequestMessage) => getTransactionsFromRpcMessage(data),
    [],
  );
}

export function useGetMakeSendRpcSuccessResponse() {
  return useCallback(
    ({ tabId, messageId }) =>
      (transactions: StacksTransactionWire[]) => {
        sendSignTransactionsSuccessResponseMessage({
          tabId,
          messageId,
          result: {
            transactions: transactions.map((transaction) => transaction.serialize()),
          },
        });
      },
    [],
  );
}

/**
 * Estimates the transaction's fee priority.
 */
export function useGetTransactionFeePriority(transaction: StacksTransactionWire) {
  const { t } = useTranslation();
  const lowLabel = t('TRANSACTION_SETTING.PRIORITIES.LOW');
  const mediumLabel = t('TRANSACTION_SETTING.PRIORITIES.MEDIUM');
  const highLabel = t('TRANSACTION_SETTING.PRIORITIES.HIGH');

  const selectedNetwork = useNetworkSelector();
  const query = useQuery({
    queryKey: ['estimate-fee-priority', transaction, selectedNetwork],
    // We need a custom hash fn b/c `transaction` has bigints, which React
    // Query's default hashing function, JSON.stringify, can't handle.
    queryKeyHashFn: (queryKey) => JSON.stringify(queryKey, bigIntReplacer),
    queryFn: async () => estimateStacksTransactionWithFallback(transaction, selectedNetwork),
    select([low, medium, high]) {
      const { fee } = transaction.auth.spendingCondition;

      const lowMediumMidpoint = (low.fee + medium.fee) / 2;
      const mediumHighMidpoint = (medium.fee + high.fee) / 2;

      if (fee < lowMediumMidpoint) return lowLabel;
      if (fee < mediumHighMidpoint) return mediumLabel;
      return highLabel;
    },
  });

  return query;
}
