import useWalletSelector from '@hooks/useWalletSelector';
import { getCollectionSpecificInscriptions } from '@secretkeylabs/xverse-core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';

const PAGE_SIZE = 30;

/**
 * Get inscriptions belonging to an address, filtered by collection id
 */
const useAddressInscriptions = (collectionId?: string) => {
  const { ordinalsAddress } = useWalletSelector();

  const getInscriptionsByAddress = async ({ pageParam = 0 }) => {
    if (!ordinalsAddress || !collectionId) {
      throw new InvalidParamsError('ordinalsAddress and collectionId are required');
    }

    // TODO cui: remove mock data after QA
    const testAddress = localStorage.getItem('testAddress');
    if (testAddress) {
      return getCollectionSpecificInscriptions(
        testAddress,
        collectionId,
        pageParam || 0, // offset,
        PAGE_SIZE, // limit
      );
    }
    return getCollectionSpecificInscriptions(
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
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );
};

export default useAddressInscriptions;
