import { type BtcFeeResponse } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useXverseApi from './apiClients/useXverseApi';
import useWalletSelector from './useWalletSelector';

function useBtcFeeRate() {
  const { network } = useWalletSelector();
  const xverseApi = useXverseApi();

  return useQuery<BtcFeeResponse, Error>({
    queryKey: ['btcFeeRate', network.type],
    queryFn: () => xverseApi.fetchBtcFeeRate(),
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}

export default useBtcFeeRate;
