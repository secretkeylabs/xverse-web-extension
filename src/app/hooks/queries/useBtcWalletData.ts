import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { BtcAddressData } from '@secretkeylabs/xverse-core/types';
import { SetBtcWalletDataAction } from '@stores/wallet/actions/actionCreators';
import useBtcClient from '@hooks/useBtcClient';
import useWalletSelector from '../useWalletSelector';
import { useLocation } from 'react-router-dom';

export const useBtcWalletData = () => {
  const dispatch = useDispatch();
  const { btcAddress, dlcBtcAddress, network } = useWalletSelector();
  const location = useLocation();
  const btcClient = useBtcClient();
  const address = location.pathname.startsWith('/dlc') || location.pathname.endsWith('nested')
    ? dlcBtcAddress
    : btcAddress;

  const fetchBtcWalletData = async () => {
    try {
      const btcData: BtcAddressData = await btcClient.getBalance(address);
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
  });
};

export default useBtcWalletData;
