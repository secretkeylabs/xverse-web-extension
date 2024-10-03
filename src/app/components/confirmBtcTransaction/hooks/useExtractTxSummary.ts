import useTransactionContext from '@hooks/useTransactionContext';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import {
  btcTransaction,
  extractViewSummary,
  type AggregatedSummary,
  type NetworkType,
  type UserTransactionSummary,
} from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';

export default function useExtractTxSummary(
  network: NetworkType,
  summary?: TransactionSummary | btcTransaction.PsbtSummary,
) {
  const [data, setData] = useState<UserTransactionSummary | AggregatedSummary | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const context = useTransactionContext();
  useEffect(() => {
    if (!summary) return;

    setIsLoading(true);
    extractViewSummary(context, summary, network)
      .then((extractedSummary) => {
        setData(extractedSummary);
      })
      .finally(() => setIsLoading(false));
  }, [context, network, summary]);

  return { data, isLoading };
}
