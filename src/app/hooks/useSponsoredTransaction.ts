import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSponsorInfo } from '@secretkeylabs/xverse-core/api';

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

export const useSponsoredTransaction = () => {
  // TODO default to false after testing UI
  const [isSponsored, setIsSponsored] = useState(true);

  // TODO: fetch from xverse-core sponsor service once it is deployed
  // const { error, data: isActive } = useSponsorInfoQuery();
  // useEffect(() => {
  //   if (!error) {
  //     setIsSponsored(!!isActive);
  //   }
  // }, [isActive, error]);


  return {
    isSponsored,
    setIsSponsored,
  };
};

export default useSponsoredTransaction;
