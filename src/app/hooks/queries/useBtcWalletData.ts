import useBtcClient from '@hooks/useBtcClient';
import type { BtcAddressData } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useWalletSelector from '../useWalletSelector';

export const useBtcWalletData = () => {
  const { btcAddress } = useWalletSelector();
  const btcClient = useBtcClient();

  const fetchBtcWalletData = async () => {
    const btcData: BtcAddressData = await btcClient.getBalance(btcAddress);
    return btcData.finalBalance;
  };

  return useQuery({
    queryKey: ['btc-wallet-data', btcAddress],
    queryFn: fetchBtcWalletData,
    enabled: !!btcAddress,
    staleTime: 10 * 1000, // 10 secs
  });
};

export default useBtcWalletData;
