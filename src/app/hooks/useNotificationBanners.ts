import { getXverseApiClient } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import useWalletSelector from './useWalletSelector';
import useWalletSession from './useWalletSession';

function useNotificationBanners() {
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

  const fetchNotificationBanners = async () => {
    const response = await getXverseApiClient(network.type).getNotificationBanners();

    return response;
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notificationBanners', sessionStartTime],
    queryFn: fetchNotificationBanners,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    data,
    isLoading,
    refetch,
  };
}

export default useNotificationBanners;
