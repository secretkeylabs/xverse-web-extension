import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSponsorInfo } from '@secretkeylabs/xverse-core/api';
import { StacksTransaction } from '@secretkeylabs/xverse-core';
import { AlexSDK } from 'alex-sdk';

export const useSponsorInfoQuery = () =>
  useQuery({
    queryKey: ['sponsorInfo'],
    queryFn: async () => {
      try {
        return await getSponsorInfo();
      } catch (e: any) {
        return Promise.reject(e);
      }
    },
  });

export const useSponsoredTransaction = (isSponsorOptionSelected: boolean) => {
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const alex = new AlexSDK();
  const { error, data: isActive, isLoading } = useSponsorInfoQuery();

  useEffect(() => {
    if (!isLoading && !error) {
      setIsServiceRunning(!!isActive);
    }
  }, [isActive, error, isLoading]);

  const sponsorTransactionToUrl = async (signed: StacksTransaction) =>
    alex.broadcastSponsoredTx(signed.serialize().toString('hex'));

  return {
    isSponsored: isServiceRunning && isSponsorOptionSelected,
    isServiceRunning,
    sponsorTransaction: sponsorTransactionToUrl,
  };
};

export default useSponsoredTransaction;
