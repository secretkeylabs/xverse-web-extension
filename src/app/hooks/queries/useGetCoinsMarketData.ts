import useXverseApi from '@hooks/apiClients/useXverseApi';
import { useQuery } from '@tanstack/react-query';

const useGetCoinsMarketData = (searchId: string) => {
  const xverseApi = useXverseApi();
  const ids = ['bitcoin', 'blockstack'].includes(searchId) ? ['bitcoin', 'blockstack'] : [searchId];

  const queryFn = async () => {
    const response = await xverseApi.getCoinsMarketData(ids);
    return response;
  };

  return useQuery({
    queryKey: ['get-coins-market-data', ids.join(',')],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn,
    select: (data) => data.find(({ id }) => searchId === id),
  });
};

export default useGetCoinsMarketData;
