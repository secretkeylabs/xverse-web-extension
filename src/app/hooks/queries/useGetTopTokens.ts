import useXverseApi from '@hooks/apiClients/useXverseApi';
import { useQuery } from '@tanstack/react-query';

const useGetTopTokens = () => {
  const xverseApi = useXverseApi();

  const queryFn = async () => {
    const response = await xverseApi.getTopTokens();
    return response;
  };

  return useQuery({
    queryKey: ['top-tokens'],
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn,
  });
};

export default useGetTopTokens;
