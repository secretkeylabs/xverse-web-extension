import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { fetchBtcTransactionsData } from '@secretkeylabs/xverse-core/api';
import { BtcAddressData } from '@secretkeylabs/xverse-core/types';
import { SetBtcWalletDataAction } from '@stores/wallet/actions/actionCreators';
import useWalletSelector from '../useWalletSelector';
import useNetworkSelector from '../useNetwork';

export const useBtcWalletData = () => {
  const dispatch = useDispatch();
  const { btcAddress } = useWalletSelector();
  const currentNetworkInstance = useNetworkSelector();

  const fetchBtcWalletData = async () => {
    try {
      const btcData: BtcAddressData = await fetchBtcTransactionsData(
        btcAddress,
        currentNetworkInstance
      );
      const btcBalance = new BigNumber(btcData.finalBalance);
      dispatch(SetBtcWalletDataAction(btcBalance, btcData.transactions));
      return btcData;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return useQuery({
    queryKey: [`wallet-data-${btcAddress}`],
    queryFn: fetchBtcWalletData,
    refetchOnMount: false,
  });
};

export default useBtcWalletData;
