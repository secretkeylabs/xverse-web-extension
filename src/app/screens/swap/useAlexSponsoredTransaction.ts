import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StacksTransaction } from '@secretkeylabs/xverse-core';
import { AlexSDK } from 'alex-sdk';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useWalletSelector from '@hooks/useWalletSelector';

const useAlexSponsorSwapEnabledQuery = (alexSDK: AlexSDK) =>
  useQuery({
    queryKey: ['alexSponsoredSwapEnabled'],
    queryFn: alexSDK.isSponsoredSwapEnabled,
  });

export const useAlexSponsoredTransaction = (userOverrideSponsorValue: boolean) => {
  const alexSDK = useRef(new AlexSDK()).current;
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const { error, data: isEnabled, isLoading } = useAlexSponsorSwapEnabledQuery(alexSDK);
  const { stxNonce } = useWalletSelector();
  let hasPendingTransactions = false;

  useEffect(() => {
    if (!isLoading && !error) {
      setIsServiceRunning(!!isEnabled);
    }
  }, [isEnabled, error, isLoading]);

  const sponsorTransaction = async (signed: StacksTransaction) =>
    alexSDK.broadcastSponsoredTx(signed.serialize().toString('hex'));

  const { data: stxPendingTxData } = useStxPendingTxData();
  const pendingTransactionNonce =
    stxPendingTxData?.pendingTransactions && stxPendingTxData?.pendingTransactions[0]?.nonce + 1;

  //ignore pending transactions if account nonce has advanced pass the nonce in pending transactions
  if (stxNonce > pendingTransactionNonce) {
    hasPendingTransactions = false;
  } else {
    hasPendingTransactions = stxPendingTxData?.pendingTransactions?.length > 0;
  }
  return {
    isSponsored: userOverrideSponsorValue && isServiceRunning && !hasPendingTransactions,
    isServiceRunning,
    sponsorTransaction,
    isSponsorDisabled: hasPendingTransactions,
  };
};

export default useAlexSponsoredTransaction;
