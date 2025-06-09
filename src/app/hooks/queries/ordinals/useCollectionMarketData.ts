import useXverseApi from '@hooks/apiClients/useXverseApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { type CollectionMarketDataResponse } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { InvalidParamsError, handleRetries } from '@utils/query';

/**
 * Get inscription collection market data
 */
const useInscriptionCollectionMarketData = (collectionId?: string | null) => {
  const xverseApiClient = useXverseApi();
  const { network } = useWalletSelector();

  const collectionMarketData = async (): Promise<CollectionMarketDataResponse | null> => {
    if (!collectionId) {
      throw new InvalidParamsError('collectionId is required');
    }
    const res = await xverseApiClient.getCollectionMarketData(collectionId);
    return res ?? null;
  };

  return useQuery({
    enabled: !!collectionId,
    retry: handleRetries,
    queryKey: ['collection-market-data', collectionId, network.type],
    queryFn: collectionMarketData,
    staleTime: 1 * 60 * 1000, // 1 min
  });
};

export default useInscriptionCollectionMarketData;
