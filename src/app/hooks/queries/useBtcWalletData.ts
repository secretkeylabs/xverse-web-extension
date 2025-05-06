import useBtcClient from '@hooks/apiClients/useBtcClient';
import useSelectedAccount from '@hooks/useSelectedAccount';
import type { BtcAddressData } from '@secretkeylabs/xverse-core';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

const useBtcWalletData = () => {
  const { btcAddress } = useSelectedAccount();
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
    placeholderData: keepPreviousData,
  });
};

export default useBtcWalletData;
