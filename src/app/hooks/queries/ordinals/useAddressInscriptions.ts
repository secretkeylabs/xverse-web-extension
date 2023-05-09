import useOrdinalsApi from '@hooks/useOrdinalsApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { useInfiniteQuery } from '@tanstack/react-query';

const useAddressInscriptions = () => {
  const { ordinalsAddress } = useWalletSelector();
  const ordinalsApi = useOrdinalsApi();

  const PageSize = 60;

  const getInscriptionsByAddress = async ({ pageParam = 0 }) => {
    const response = await ordinalsApi.getInscriptions(
      ordinalsAddress,
      pageParam || 0,
      PageSize,
    );
    return response;
  };

  const {
    isLoading, data, fetchNextPage, isFetchingNextPage, hasNextPage, refetch,
  } = useInfiniteQuery([`inscriptions-${ordinalsAddress}`], getInscriptionsByAddress, {
    keepPreviousData: false,
    getNextPageParam: (lastpage, pages) => {
      const currentLength = pages.map((page) => page.results).flat().length;
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

export default useAddressInscriptions;
