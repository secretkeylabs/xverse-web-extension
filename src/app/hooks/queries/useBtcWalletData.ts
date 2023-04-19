import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { BtcAddressData } from '@secretkeylabs/xverse-core/types';
import { SetBtcWalletDataAction } from '@stores/wallet/actions/actionCreators';
import useBtcClient from '@hooks/useBtcClient';
import useWalletSelector from '../useWalletSelector';

export const useBtcWalletData = () => {
  const dispatch = useDispatch();
  const { btcAddress } = useWalletSelector();
  const btcClient = useBtcClient();

  const fetchBtcWalletData = async () => {
    try {
      const btcData: BtcAddressData = await btcClient.getBalance(btcAddress);
      const btcBalance = new BigNumber(btcData.finalBalance);
      dispatch(SetBtcWalletDataAction(btcBalance));
      return btcData;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return useQuery({
    queryKey: [`wallet-data-${btcAddress}`],
    refetchOnWindowFocus: true,
    queryFn: fetchBtcWalletData,
  });
};

export default useBtcWalletData;
