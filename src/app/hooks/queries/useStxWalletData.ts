import type { StxAddressData } from '@secretkeylabs/xverse-core';
import { fetchStxAddressData } from '@secretkeylabs/xverse-core';
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
    queryKey: ['stx-wallet-data', stxAddress],
    queryFn: fetchStxWalletData,
    enabled: !!stxAddress,
    staleTime: 10 * 1000, // 10 secs
  });
};

export default useStxWalletData;
