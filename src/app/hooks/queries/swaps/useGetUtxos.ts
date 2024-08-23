import useWalletSelector from '@hooks/useWalletSelector';
import {
  getXverseApiClient,
  type GetUtxosRequest,
  type GetUtxosResponse,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useGetUtxos = (body: GetUtxosRequest | null) => {
  const { network } = useWalletSelector();

  return useQuery<GetUtxosResponse, Error>({
    queryKey: ['getUtxos', body, network.type],
    queryFn: async () => {
      if (!body) {
        throw new Error('Request body is null');
      }
      const client = getXverseApiClient(network.type);
      const response = await client.swaps.getUtxos(body);
      return response;
    },
    enabled: !!body,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

export default useGetUtxos;
