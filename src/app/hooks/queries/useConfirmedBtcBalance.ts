import useBtcClient from '@hooks/useBtcClient';
import { useQuery } from '@tanstack/react-query';
import useWalletSelector from '../useWalletSelector';

const useConfirmBtcBalance = () => {
  const { btcAddress } = useWalletSelector();
  const btcClient = useBtcClient();

  const fetchBtcAddressData = async () => btcClient.getAddressData(btcAddress);

  let confirmedBalance: number = 0;

  const response = useQuery({
    queryKey: ['btc-address-data'],
    queryFn: fetchBtcAddressData,
  });

  const chainStats = response.data?.chain_stats;
  const mempoolStats = response.data?.mempool_stats;
  if (chainStats && mempoolStats) {
    confirmedBalance =
      chainStats.funded_txo_sum - chainStats.spent_txo_sum - mempoolStats.spent_txo_sum;
  }

  return {
    confirmedBalance,
  };
};

export default useConfirmBtcBalance;
