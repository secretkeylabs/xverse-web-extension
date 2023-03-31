import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { getBtcWalletData } from '@secretkeylabs/xverse-core/api/btc';
import { BtcAddressData } from '@secretkeylabs/xverse-core/types';
import { SetBtcWalletDataAction } from '@stores/wallet/actions/actionCreators';
import useWalletSelector from '../useWalletSelector';
import { useLocation } from 'react-router-dom';

export const useBtcWalletData = () => {
  const dispatch = useDispatch();
  const { btcAddress, dlcBtcAddress, network } = useWalletSelector();
  const location = useLocation();
  const address = [
    '/dlc-list',
    '/dlc-offer-request',
    '/dlc-details',
    '/send-btc-prefilled/nested',
  ].includes(location.pathname)
    ? dlcBtcAddress
    : btcAddress;

  const fetchBtcWalletData = async () => {
    try {
      const btcData: BtcAddressData = await getBtcWalletData(address, network.type);
      console.log('🚀 ~ file: useBtcWalletData.ts:16 ~ fetchBtcWalletData ~ btcData:', btcData);

      const btcBalance = new BigNumber(btcData.finalBalance);
      dispatch(SetBtcWalletDataAction(btcBalance));
      return btcData;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return useQuery({
    queryKey: [`wallet-data-${address}`],
    queryFn: fetchBtcWalletData,
    refetchOnMount: false,
  });
};

export default useBtcWalletData;
