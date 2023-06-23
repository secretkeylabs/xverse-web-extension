import useOrdinalsApi from '@hooks/useOrdinalsApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { useInfiniteQuery } from '@tanstack/react-query';

const useAddressInscriptions = () => {
  const { ordinalsAddress } = useWalletSelector();
  const ordinalsApi = useOrdinalsApi();

  const PageSize = 30;

  const getInscriptionsByAddress = async ({ pageParam = 0 }) => {
    try {
      const response = await ordinalsApi.getInscriptions(ordinalsAddress, pageParam || 0, PageSize);
      return response;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const {
    isLoading, data, isFetchingNextPage, hasNextPage, error, refetch, fetchNextPage,
  } = useInfiniteQuery([`inscriptions-${ordinalsAddress}`], getInscriptionsByAddress, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  };
};

export default useAddressInscriptions;
