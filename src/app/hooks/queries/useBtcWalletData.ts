import useBtcClient from '@hooks/useBtcClient';
import type { BtcAddressData } from '@secretkeylabs/xverse-core';
import { SetBtcWalletDataAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';
import useWalletSelector from '../useWalletSelector';

export const useBtcWalletData = () => {
  const dispatch = useDispatch();
  const { btcAddress } = useWalletSelector();
  const btcClient = useBtcClient();

  const fetchBtcWalletData = async () => {
    const btcData: BtcAddressData = await btcClient.getBalance(btcAddress);
    const btcBalance = new BigNumber(btcData.finalBalance);
    dispatch(SetBtcWalletDataAction(btcBalance));
    return btcData;
  };

  return useQuery({
    queryKey: [`wallet-data-${btcAddress}`],
    refetchOnWindowFocus: true,
    queryFn: fetchBtcWalletData,
    enabled: !!btcAddress,
  });
};

export default useBtcWalletData;
