import useAsyncFn from '@hooks/useAsyncFn';
import useTransactionContext from '@hooks/useTransactionContext';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import {
  btcTransaction,
  extractViewSummary,
  type AggregatedSummary,
  type NetworkType,
  type UserTransactionSummary,
} from '@secretkeylabs/xverse-core';
import { useState } from 'react';

export default function useExtractTxSummary(
  network: NetworkType,
  summary?: TransactionSummary | btcTransaction.PsbtSummary,
) {
  const [data, setData] = useState<UserTransactionSummary | AggregatedSummary | undefined>(
    undefined,
  );

  const context = useTransactionContext();
  const { isLoading } = useAsyncFn(
    async ({ signal }) => {
      if (!summary) return;

      const extractedSummary = await extractViewSummary(context, summary, network);
      if (!signal.aborted) {
        setData(extractedSummary);
      }
    },
    [context, network, summary],
  );

  return { data, isLoading };
}
