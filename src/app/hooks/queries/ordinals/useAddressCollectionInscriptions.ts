import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { useInfiniteQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';

const PAGE_SIZE = 30;

/**
 * Get a specific collection belonging to an address
 */
const useAddressCollectionInscriptions = (collectionId?: string) => {
  const { ordinalsAddress } = useSelectedAccount();
  const xverseApiClient = useXverseApi();
  const { starredCollectibleIds } = useWalletSelector();
  const starredIds = starredCollectibleIds[ordinalsAddress]?.map(({ id }) => id);

  const getCollectionInscriptionsByAddress = async ({ pageParam = 0 }) => {
    if (!ordinalsAddress || !collectionId) {
      throw new InvalidParamsError('ordinalsAddress and collectionId are required');
    }
    return xverseApiClient.getCollectionSpecificInscriptions(
      ordinalsAddress,
      collectionId,
      pageParam,
      PAGE_SIZE,
      {
        starredCollectibleIds: starredIds,
      },
    );
  };

  return useInfiniteQuery(
    ['address-collection-inscriptions', ordinalsAddress, collectionId, starredIds],
    getCollectionInscriptionsByAddress,
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
      staleTime: 60 * 1000, // 1 min
      keepPreviousData: true,
    },
  );
};

export default useAddressCollectionInscriptions;
