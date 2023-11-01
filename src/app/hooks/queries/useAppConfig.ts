import useWalletSelector from '@hooks/useWalletSelector';
import { getAppConfig } from '@secretkeylabs/xverse-core/api/xverse';
import { ChangeNetworkAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

const useAppConfig = () => {
  const { network, networkAddress, btcApiUrl } = useWalletSelector();
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ['app-config', network.type, btcApiUrl],
    queryFn: async () => {
      const response = await getAppConfig(network.type);
      if (response.data.btcApiURL && network.type === 'Mainnet' && !btcApiUrl) {
        const updatedNetwork = { ...network, btcApiUrl: response.data.btcApiURL };
        dispatch(ChangeNetworkAction(updatedNetwork, networkAddress, ''));
      }
      return response;
    },
  });
};

export default useAppConfig;
