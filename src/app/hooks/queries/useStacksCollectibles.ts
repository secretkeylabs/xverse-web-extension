import { NftsListData } from '@secretkeylabs/xverse-core/types';
import { getNfts } from '@secretkeylabs/xverse-core/api/stacks';
import { useInfiniteQuery } from '@tanstack/react-query';
import useWalletSelector from '@hooks/useWalletSelector';
import useNetworkSelector from '@hooks/useNetwork';

const useStacksCollectibles = () => {
  const { stxAddress } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();

  function fetchNfts({ pageParam = 0 }): Promise<NftsListData> {
    return getNfts(stxAddress, selectedNetwork, pageParam);
  }

  const {
    isLoading, data, fetchNextPage, isFetchingNextPage, hasNextPage, refetch,
  } = useInfiniteQuery([`nft-meta-data${stxAddress}`], fetchNfts, {
    keepPreviousData: false,
    getNextPageParam: (lastpage, pages) => {
      const currentLength = pages.map((page) => page.nftsList).flat().length;
      if (currentLength < lastpage.total) {
        return currentLength;
      }
      return false;
    },
  });

  return {
    isLoading,
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  };
};

export default useStacksCollectibles;
