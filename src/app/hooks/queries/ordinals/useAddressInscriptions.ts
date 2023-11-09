import useWalletSelector from '@hooks/useWalletSelector';
import { getCollectionSpecificInscriptions } from '@secretkeylabs/xverse-core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';

const PAGE_SIZE = 30;

/**
 * Get inscriptions belonging to an address, filtered by collection id
 */
const useAddressInscriptions = (collectionId?: string) => {
  const { ordinalsAddress, network } = useWalletSelector();

  const getInscriptionsByAddress = async ({ pageParam = 0 }) => {
    if (!ordinalsAddress || !collectionId) {
      throw new InvalidParamsError('ordinalsAddress and collectionId are required');
    }
    return getCollectionSpecificInscriptions(
      network.type,
      ordinalsAddress,
      collectionId,
      pageParam || 0, // offset,
      PAGE_SIZE, // limit
    );
  };

  return useInfiniteQuery(
    ['inscriptions', ordinalsAddress, collectionId], // cache key
    getInscriptionsByAddress,
    {
      enabled: !!(collectionId && ordinalsAddress),
      retry: handleRetries,
      getNextPageParam: (lastpage, pages) => {
        const currentLength = pages
          .map((page) => page.data)
          .filter(Boolean)
          .flat().length;
        if (currentLength < lastpage.total) {
          return currentLength;
        }
        return false;
      },
      staleTime: 1 * 60 * 1000, // 1 min
    },
  );
};

export default useAddressInscriptions;
