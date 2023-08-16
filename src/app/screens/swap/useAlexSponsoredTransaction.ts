import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getConfirmedTransactions,
  StacksTransaction,
  StxTransactionListData,
} from '@secretkeylabs/xverse-core';
import { AlexSDK } from 'alex-sdk';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useWalletSelector from '@hooks/useWalletSelector';
import useNetworkSelector from '@hooks/useNetwork';

const useAlexSponsorSwapEnabledQuery = (alexSDK: AlexSDK) =>
  useQuery({
    queryKey: ['alexSponsoredSwapEnabled'],
    queryFn: alexSDK.isSponsoredSwapEnabled,
  });

export const useAlexSponsoredTransaction = (userOverrideSponsorValue: boolean) => {
  const alexSDK = useRef(new AlexSDK()).current;
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [hasPendingTransactions, setHasPendingTransactions] = useState(false);
  const { error, data: isEnabled, isLoading } = useAlexSponsorSwapEnabledQuery(alexSDK);
  const { stxAddress } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const { data: stxPendingTxData } = useStxPendingTxData();

  useEffect(() => {
    if (!isLoading && !error) {
      setIsServiceRunning(!!isEnabled);
    }
  }, [isEnabled, error, isLoading]);

  const sponsorTransaction = async (signed: StacksTransaction) =>
    alexSDK.broadcastSponsoredTx(signed.serialize().toString('hex'));

  const getAccountCurrentNonce = async () => {
    let nonce = 0;
    const confirmedTransactions: StxTransactionListData = await getConfirmedTransactions({
      stxAddress,
      network: selectedNetwork,
    });

    if (confirmedTransactions && confirmedTransactions.transactionsList.length > 0) {
      nonce = confirmedTransactions.transactionsList[0].nonce + 1;
    }
    const currentPendingNonce =
      (stxPendingTxData?.pendingTransactions ?? []).reduce(
        (maxNonce, transaction) => Math.max(maxNonce, transaction?.nonce ?? 0),
        0,
      ) + 1;

    return Math.max(currentPendingNonce, nonce);
  };

  useEffect(() => {
    (async () => {
      const currentNonce = await getAccountCurrentNonce();
      const filteredStxPendingTxData = stxPendingTxData?.pendingTransactions.filter(
        (transaction) => currentNonce - transaction?.nonce === 1,
      );

      setHasPendingTransactions(filteredStxPendingTxData?.length > 0);
    })();
  }, [stxPendingTxData]);

  return {
    isSponsored: userOverrideSponsorValue && isServiceRunning && !hasPendingTransactions,
    isServiceRunning,
    sponsorTransaction,
    isSponsorDisabled: hasPendingTransactions,
  };
};

export default useAlexSponsoredTransaction;
