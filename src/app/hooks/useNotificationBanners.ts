import { getXverseApiClient } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useWalletSelector from './useWalletSelector';

function useNotificationBanners() {
  const { network } = useWalletSelector();

  const fetchNotificationBanners = async () => {
    const response = await getXverseApiClient(network.type).getNotificationBanners();

    return response;
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['notificationBanners'],
    queryFn: fetchNotificationBanners,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    data,
    isLoading,
    isFetching,
    refetch,
  };
}

export default useNotificationBanners;
