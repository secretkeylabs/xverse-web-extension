import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { getCollections } from '@secretkeylabs/xverse-core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';

const PAGE_SIZE = 30;

/**
 * Get collections belonging to an address
 */
const useAddressInscriptionCollections = () => {
  const { ordinalsAddress } = useSelectedAccount();
  const { network } = useWalletSelector();

  const getCollectionsByAddress = async ({ pageParam = 0 }) => {
    if (!ordinalsAddress) {
      throw new InvalidParamsError('ordinalsAddress is required');
    }
    return getCollections(network.type, ordinalsAddress, pageParam || 0, PAGE_SIZE);
  };

  return useInfiniteQuery(['inscription-collections', ordinalsAddress], getCollectionsByAddress, {
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
    staleTime: 1 * 60 * 1000, // 1 min
  });
};

export default useAddressInscriptionCollections;
