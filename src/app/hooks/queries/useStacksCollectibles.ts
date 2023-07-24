import { NftsListData } from '@secretkeylabs/xverse-core/types';
import { getNfts } from '@secretkeylabs/xverse-core/api/stacks';
import { useInfiniteQuery } from '@tanstack/react-query';
import useWalletSelector from '@hooks/useWalletSelector';
import useNetworkSelector from '@hooks/useNetwork';
import { InvalidParamsError, handleRetries } from '@utils/query';

const useStacksCollectibles = () => {
  const { stxAddress } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();

  function fetchNfts({ pageParam = 0 }): Promise<NftsListData> {
    if (!stxAddress) {
      return Promise.reject(new InvalidParamsError("stxAddress is required"));
    }
    return getNfts(stxAddress, selectedNetwork, pageParam);
  }

  const { isLoading, data, fetchNextPage, isFetchingNextPage, hasNextPage, refetch, error } =
    useInfiniteQuery([`nft-meta-data-${stxAddress}`], fetchNfts, {
      retry: handleRetries,
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
    error,
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  };
};

export default useStacksCollectibles;
