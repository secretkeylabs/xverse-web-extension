import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSponsorInfo } from '@secretkeylabs/xverse-core';

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

  const { error, data: isActive } = useSponsorInfoQuery(sponsorUrl);
  useEffect(() => {
    if (!error) {
      setIsSponsored(!!isActive);
    }
  }, [isActive, error]);

  return {
    isSponsored,
    setIsSponsored,
  };
};

export default useSponsoredTransaction;
