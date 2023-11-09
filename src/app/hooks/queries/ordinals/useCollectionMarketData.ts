import useWalletSelector from '@hooks/useWalletSelector';
import { CollectionMarketDataResponse, getCollectionMarketData } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';

/**
 * Get inscription collection market data
 */
const useInscriptionCollectionMarketData = (collectionId?: string | null) => {
  const { network } = useWalletSelector();
  const collectionMarketData = async (): Promise<CollectionMarketDataResponse | undefined> => {
    if (!collectionId) {
      throw new InvalidParamsError('collectionId is required');
    }
    return getCollectionMarketData(network.type, collectionId);
  };

  return useQuery({
    enabled: !!collectionId,
    retry: handleRetries,
    queryKey: ['collection-market-data', collectionId],
    queryFn: collectionMarketData,
    staleTime: 1 * 60 * 1000, // 1 min
  });
};

export default useInscriptionCollectionMarketData;
