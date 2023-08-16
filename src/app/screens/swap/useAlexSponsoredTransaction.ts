import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StacksTransaction } from '@secretkeylabs/xverse-core';
import { AlexSDK } from 'alex-sdk';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';

const useAlexSponsorSwapEnabledQuery = (alexSDK: AlexSDK) =>
  useQuery({
    queryKey: ['alexSponsoredSwapEnabled'],
    queryFn: alexSDK.isSponsoredSwapEnabled,
  });

export const useAlexSponsoredTransaction = (userOverrideSponsorValue: boolean) => {
  const alexSDK = useRef(new AlexSDK()).current;
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const { error, data: isEnabled, isLoading } = useAlexSponsorSwapEnabledQuery(alexSDK);

  useEffect(() => {
    if (!isLoading && !error) {
      setIsServiceRunning(!!isEnabled);
    }
  }, [isEnabled, error, isLoading]);

  const sponsorTransaction = async (signed: StacksTransaction) =>
    alexSDK.broadcastSponsoredTx(signed.serialize().toString('hex'));

  const { data: stxPendingTxData } = useStxPendingTxData();
  const currentNonce =
    (stxPendingTxData?.pendingTransactions ?? []).reduce(
      (maxNonce, transaction) => Math.max(maxNonce, transaction?.nonce ?? 0),
      0,
    ) + 1;

  const filteredStxPendingTxData = stxPendingTxData?.pendingTransactions.filter(
    (transaction) => currentNonce - transaction?.nonce === 1,
  );
  const hasPendingTransactions = filteredStxPendingTxData?.length > 0;

  return {
    isSponsored: userOverrideSponsorValue && isServiceRunning && !hasPendingTransactions,
    isServiceRunning,
    sponsorTransaction,
    isSponsorDisabled: hasPendingTransactions,
  };
};

export default useAlexSponsoredTransaction;
