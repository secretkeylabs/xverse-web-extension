import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StacksTransaction } from '@secretkeylabs/xverse-core';
import { AlexSDK } from 'alex-sdk';

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

  return {
    isSponsored: userOverrideSponsorValue && isServiceRunning,
    isServiceRunning,
    sponsorTransaction,
  };
};

export default useAlexSponsoredTransaction;
