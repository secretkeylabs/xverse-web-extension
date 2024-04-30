import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import { buf2hex } from '@secretkeylabs/xverse-core';
import { StacksTransaction } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import { AlexSDK } from 'alex-sdk';
import { useEffect, useRef, useState } from 'react';

const useAlexSponsorSwapEnabledQuery = (alexSDK: AlexSDK) =>
  useQuery({
    queryKey: ['alexSponsoredSwapEnabled'],
    queryFn: alexSDK.isSponsoredSwapEnabled,
  });

export const useAlexSponsoredTransaction = (userOverrideSponsorValue: boolean) => {
  const alexSDK = useRef(new AlexSDK()).current;
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const { error, data: isEnabled, isLoading } = useAlexSponsorSwapEnabledQuery(alexSDK);
  const { data: stxData } = useStxWalletData();

  useEffect(() => {
    if (!isLoading && !error) {
      setIsServiceRunning(!!isEnabled);
    }
  }, [isEnabled, error, isLoading]);

  const sponsorTransaction = async (signed: StacksTransaction) =>
    alexSDK.broadcastSponsoredTx(buf2hex(signed.serialize()));

  const { data: stxPendingTxData } = useStxPendingTxData();
  const upcomingPendingTransactionNonce =
    (stxPendingTxData?.pendingTransactions ?? []).reduce(
      (maxNonce, transaction) => Math.max(maxNonce, transaction?.nonce ?? 0),
      0,
    ) + 1;

  let hasPendingTransactions: boolean;
  // ignore pending transactions if account nonce has advanced pass the nonce in pending transactions
  if ((stxData?.nonce ?? 0) > upcomingPendingTransactionNonce) {
    hasPendingTransactions = false;
  } else {
    hasPendingTransactions = (stxPendingTxData?.pendingTransactions?.length ?? 0) > 0;
  }
  return {
    isSponsored: userOverrideSponsorValue && isServiceRunning && !hasPendingTransactions,
    isServiceRunning,
    sponsorTransaction,
    isSponsorDisabled: hasPendingTransactions,
  };
};

export default useAlexSponsoredTransaction;
