import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { StxAddressData } from '@secretkeylabs/xverse-core/types';
import { fetchStxAddressData } from '@secretkeylabs/xverse-core/api';
import { PAGINATION_LIMIT } from '@utils/constants';
import { setStxWalletDataAction } from '@stores/wallet/actions/actionCreators';
import useWalletSelector from '../useWalletSelector';
import useNetworkSelector from '../useNetwork';

export const useStxWalletData = () => {
  const dispatch = useDispatch();
  const { stxAddress } = useWalletSelector();
  const currentNetworkInstance = useNetworkSelector();

  const fetchStxWalletData = async (): Promise<StxAddressData> => {
    try {
      const stxData: StxAddressData = await fetchStxAddressData(
        stxAddress,
        currentNetworkInstance,
        0,
        PAGINATION_LIMIT,
      );
      dispatch(
        setStxWalletDataAction(
          stxData.balance,
          stxData.availableBalance,
          stxData.locked,
          stxData.transactions,
          stxData.nonce,
        ),
      );
      return stxData;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return useQuery({
    queryKey: [`wallet-data-${stxAddress}`],
    queryFn: fetchStxWalletData,
    refetchOnMount: false,
  });
};

export default useStxWalletData;
