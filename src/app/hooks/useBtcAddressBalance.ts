import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import useBtcClient from './apiClients/useBtcClient';

export default function useBtcAddressBalance(address: string) {
  const btcClient = useBtcClient();

  const fetchBalance = async () => {
    if (!address) {
      return null;
    }

    const addressData = await btcClient.getAddressData(address);
    const confirmedBalance = BigNumber(addressData.chain_stats.funded_txo_sum)
      .minus(addressData.chain_stats.spent_txo_sum)
      .toNumber();
    const unconfirmedBalance = BigNumber(addressData.mempool_stats.funded_txo_sum)
      .minus(addressData.mempool_stats.spent_txo_sum)
      .toNumber();

    return { address, confirmedBalance, unconfirmedBalance };
  };

  return useQuery({
    queryKey: ['btc-address-balance', address],
    queryFn: fetchBalance,
    staleTime: 10 * 1000, // 10 secs
    placeholderData: keepPreviousData,
  });
}
