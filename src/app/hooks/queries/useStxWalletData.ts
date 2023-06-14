import { fetchStxAddressData } from '@secretkeylabs/xverse-core/api';
import { StxAddressData } from '@secretkeylabs/xverse-core/types';
import { setStxWalletDataAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { PAGINATION_LIMIT } from '@utils/constants';
import { useDispatch } from 'react-redux';
import useNetworkSelector from '../useNetwork';
import useWalletSelector from '../useWalletSelector';

export const useStxWalletData = () => {
  const dispatch = useDispatch();
  const { stxAddress } = useWalletSelector();
  const currentNetworkInstance = useNetworkSelector();

  const fetchStxWalletData = async (): Promise<StxAddressData> => {
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
  };

  return useQuery({
    queryKey: [`wallet-data-${stxAddress}`],
    queryFn: fetchStxWalletData,
    enabled: !!stxAddress,
  });
};

export default useStxWalletData;
