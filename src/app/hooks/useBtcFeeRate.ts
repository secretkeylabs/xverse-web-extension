import { getBtcFeeRate } from '@secretkeylabs/xverse-core/transactions/btc';
import { BtcFeeResponse } from '@secretkeylabs/xverse-core/types';
import { useQuery } from '@tanstack/react-query';

function useBtcFeeRate() {
  return useQuery<BtcFeeResponse, Error>({
    queryKey: ['btcFeeRate'],
    queryFn: getBtcFeeRate,
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}

export default useBtcFeeRate;
