import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSponsorInfo, sponsorTransaction } from '@secretkeylabs/xverse-core/api';
import { StacksTransaction } from '@secretkeylabs/xverse-core';

export const useSponsorInfoQuery = (sponsorUrl?: string) =>
  useQuery({
    queryKey: ['sponsorInfo'],
    queryFn: async () => {
      try {
        return await getSponsorInfo(sponsorUrl);
      } catch (e: any) {
        return Promise.reject(e);
      }
    },
  });

export const useSponsoredTransaction = (sponsorUrl?: string) => {
  const [isSponsored, setIsSponsored] = useState(false);

  const { error, data: isActive, isLoading } = useSponsorInfoQuery(sponsorUrl);

  useEffect(() => {
    if (!isLoading && !error) {
      setIsSponsored(!!isActive);
    }
  }, [isActive, error, isLoading]);

  const sponsorTransactionToUrl = async (signed: StacksTransaction) =>
    sponsorTransaction(signed, sponsorUrl);

  return {
    isSponsored,
    sponsorTransaction: sponsorTransactionToUrl,
  };
};

export default useSponsoredTransaction;
