import useBtcClient from '@hooks/useBtcClient';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import useWalletSelector from '../useWalletSelector';

const useConfirmBtcBalance = () => {
  const { btcAddress } = useWalletSelector();
  const btcClient = useBtcClient();

  const fetchBtcAddressData = async () => btcClient.getAddressData(btcAddress);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['btc-address-data'],
    queryFn: fetchBtcAddressData,
  });

  const confirmedBalance = useMemo(() => {
    if (!isLoading && !isError && data) {
      const chainStats = data.chain_stats;
      const mempoolStats = data.mempool_stats;

      if (chainStats && mempoolStats) {
        return chainStats.funded_txo_sum - chainStats.spent_txo_sum - mempoolStats.spent_txo_sum;
      }
    }
    return undefined;
  }, [data, isLoading, isError]);

  return {
    confirmedBalance,
    isLoading,
    error,
  };
};

export default useConfirmBtcBalance;
