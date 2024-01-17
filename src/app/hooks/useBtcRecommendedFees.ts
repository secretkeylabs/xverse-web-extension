import { RecommendedFeeResponse, mempoolApi } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useWalletSelector from './useWalletSelector';

function useBtcRecommendedFees() {
  const { network } = useWalletSelector();
  return useQuery<RecommendedFeeResponse, Error>({
    queryKey: ['btcRecommendedFees', network.type],
    queryFn: () => mempoolApi.getRecommendedFees(network.type),
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}

export default useBtcRecommendedFees;
