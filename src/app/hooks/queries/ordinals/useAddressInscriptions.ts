import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { useInfiniteQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';

const PAGE_SIZE = 30;

/**
 * Get collections belonging to an address
 */
const useAddressInscriptions = (showHiddenOnly?: boolean) => {
  const { ordinalsAddress } = useSelectedAccount();
  const xverseApiClient = useXverseApi();
  const { hiddenCollectibleIds, starredCollectibleIds } = useWalletSelector();
  const starredIds = starredCollectibleIds[ordinalsAddress]?.map(({ id }) => id);

  const getCollectionsByAddress = async ({ pageParam = 0 }) => {
    if (!ordinalsAddress) {
      throw new InvalidParamsError('ordinalsAddress is required');
    }
    return xverseApiClient.getCollections(ordinalsAddress, pageParam, PAGE_SIZE, {
      hiddenCollectibleIds: Object.keys(hiddenCollectibleIds[ordinalsAddress] ?? {}),
      starredCollectibleIds: starredIds,
      showHiddenOnly,
    });
  };

  return useInfiniteQuery(
    [
      'address-inscriptions',
      ordinalsAddress,
      Object.keys(hiddenCollectibleIds[ordinalsAddress] ?? {}),
      starredIds,
      showHiddenOnly,
    ],
    getCollectionsByAddress,
    {
      enabled: !!ordinalsAddress,
      retry: handleRetries,
      getNextPageParam: (lastpage, pages) => {
        const currentLength = pages
          .map((page) => page.results)
          .filter(Boolean)
          .flat().length;
        if (currentLength < lastpage.total) {
          return currentLength;
        }
        return false;
      },
      staleTime: 60 * 1000, // 1 min
    },
  );
};

export default useAddressInscriptions;
