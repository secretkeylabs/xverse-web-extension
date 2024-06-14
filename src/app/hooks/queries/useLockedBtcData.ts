import useBtcClient from '@hooks/useBtcClient';
import type { BtcAddressData } from '@secretkeylabs/xverse-core';
import { setLockedBtcBalanceAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { lockedBitcoins } from '@utils/locked';
import { useDispatch } from 'react-redux';
import useWalletSelector from '../useWalletSelector';

export const useLockedBtcData = () => {
  const { btcAddress } = useWalletSelector();
  const btcClient = useBtcClient();
  const dispatch = useDispatch();

  const fetchLockedBtcData = async () => {
    const lockedBtcMap = {};
    const lockedMap = await lockedBitcoins.get(btcAddress);
    let totalFinalBalance = 0;
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const address in lockedMap) {
      const btcData: BtcAddressData = await btcClient.getBalance(address);
      lockedBtcMap[address] = btcData;
      totalFinalBalance += btcData.finalBalance;
    }
    dispatch(setLockedBtcBalanceAction(lockedBtcMap));
    return totalFinalBalance;
  };

  return useQuery({
    queryKey: ['locked-btc-data', btcAddress],
    queryFn: fetchLockedBtcData,
    enabled: !!btcAddress,
    staleTime: 30 * 1000, // 30 secs
  });
};

export default useLockedBtcData;
