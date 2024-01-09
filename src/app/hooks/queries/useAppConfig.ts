import useWalletSelector from '@hooks/useWalletSelector';
import { getAppConfig } from '@secretkeylabs/xverse-core';
import { ChangeNetworkAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

const useAppConfig = () => {
  const { network } = useWalletSelector();
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ['app-config', network.type, network.btcApiUrl],
    queryFn: async () => {
      const response = await getAppConfig(network.type);

      // was this ever used? we set defaults for btcApiUrl in useWalletSelector
      if (response.data.btcApiURL && network.type === 'Mainnet' && !network.btcApiUrl) {
        const updatedNetwork = { ...network, btcApiUrl: response.data.btcApiURL };
        dispatch(ChangeNetworkAction(updatedNetwork));
      }

      return response;
    },
  });
};

export default useAppConfig;
