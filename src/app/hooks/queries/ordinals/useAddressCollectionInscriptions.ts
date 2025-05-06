import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
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

  const getCollectionInscriptionsByAddress = async ({ pageParam }: { pageParam: number }) => {
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

  return useInfiniteQuery({
    queryKey: ['address-collection-inscriptions', ordinalsAddress, collectionId, starredIds],
    queryFn: getCollectionInscriptionsByAddress,
    enabled: !!(collectionId && ordinalsAddress),
    retry: handleRetries,
    initialPageParam: 0,
    getNextPageParam: (lastpage, pages) => {
      const currentLength = pages
        .map((page) => page.data)
        .filter(Boolean)
        .flat().length;
      if (currentLength < lastpage.total) {
        return currentLength;
      }
      return null;
    },
    staleTime: 60_000, // 1 min
    placeholderData: keepPreviousData,
  });
};

export default useAddressCollectionInscriptions;
