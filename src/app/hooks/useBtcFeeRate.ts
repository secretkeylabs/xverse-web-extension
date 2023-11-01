import { getBtcFeeRate } from '@secretkeylabs/xverse-core/transactions/btc';
import { BtcFeeResponse } from '@secretkeylabs/xverse-core/types';
import { useQuery } from '@tanstack/react-query';
import useWalletSelector from './useWalletSelector';

function useBtcFeeRate() {
  const { network } = useWalletSelector();
  return useQuery<BtcFeeResponse, Error>({
    queryKey: ['btcFeeRate', network.type],
    queryFn: () => getBtcFeeRate(network.type),
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}

export default useBtcFeeRate;
