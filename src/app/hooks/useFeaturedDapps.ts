import { getFeaturedDapps } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import useWalletSelector from './useWalletSelector';
import useWalletSession from './useWalletSession';

function useFeaturedDapps() {
  const { network } = useWalletSelector();
  const { getSessionStartTime } = useWalletSession();
  const [sessionStartTime, setSessionStartTime] = useState<number | undefined>(undefined);

  const fetchSessionStartTime = async () => {
    const time = await getSessionStartTime();
    setSessionStartTime(time);
  };

  useEffect(() => {
    fetchSessionStartTime();
  }, []);

  const fetchFeaturedDapps = async () => {
    const response = await getFeaturedDapps(network.type);

    const featured = response.find((f) => f.section === 'Featured')?.apps;
    const recommended = response.find((f) => f.section === 'Recommended')?.apps;

    return { featured, recommended };
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['featuredApps', sessionStartTime],
    queryFn: fetchFeaturedDapps,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    data,
    isLoading,
    refetch,
  };
}

export default useFeaturedDapps;
