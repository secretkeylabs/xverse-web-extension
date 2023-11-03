import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import { getNftCollections, StacksCollectionList } from '@secretkeylabs/xverse-core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';

const useStacksCollectibles = () => {
  const { stxAddress } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();

  function fetchNfts({ pageParam = 0 }): Promise<StacksCollectionList> {
    if (!stxAddress) {
      return Promise.reject(new InvalidParamsError('stxAddress is required'));
    }
    return getNftCollections(stxAddress, selectedNetwork, pageParam || 0, 150);
  }

  return useInfiniteQuery(['nft-collection-data', stxAddress], fetchNfts, {
    retry: handleRetries,
    keepPreviousData: false,
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
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export default useStacksCollectibles;
