import useAsyncEffect from '@hooks/useAsyncEffect';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const context = useTransactionContext();
  useAsyncEffect(
    async (isEffectActive) => {
      if (!summary) return;

      setIsLoading(true);
      try {
        const extractedSummary = await extractViewSummary(context, summary, network);
        if (isEffectActive()) {
          setData(extractedSummary);
        }
      } finally {
        if (isEffectActive()) {
          setIsLoading(false);
        }
      }
    },
    [context, network, summary],
  );

  return { data, isLoading };
}
