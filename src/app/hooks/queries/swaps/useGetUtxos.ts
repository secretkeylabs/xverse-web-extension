import useXverseApi from '@hooks/apiClients/useXverseApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { type GetUtxosRequest, type GetUtxosResponse } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useGetUtxos = (body: GetUtxosRequest | null) => {
  const { network } = useWalletSelector();
  const xverseApiClient = useXverseApi();

  return useQuery<GetUtxosResponse, Error>({
    queryKey: ['getUtxos', body, network.type],
    queryFn: async () => {
      if (!body) {
        throw new Error('Request body is null');
      }
      const response = await xverseApiClient.swaps.getUtxos(body);
      return response;
    },
    enabled: !!body,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

export default useGetUtxos;
