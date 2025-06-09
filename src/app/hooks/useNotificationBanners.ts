import { useQuery } from '@tanstack/react-query';
import useXverseApi from './apiClients/useXverseApi';

function useNotificationBanners() {
  const xverseApiClient = useXverseApi();

  const fetchNotificationBanners = async () => {
    const response = await xverseApiClient.getNotificationBanners();

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
