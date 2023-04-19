import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { getAppConfig } from '@secretkeylabs/xverse-core/api/xverse';
import { ChangeNetworkAction } from '@stores/wallet/actions/actionCreators';
import useWalletSelector from '@hooks/useWalletSelector';

const useAppConfig = () => {
  const { network, networkAddress, btcApiUrl } = useWalletSelector();
  const dispatch = useDispatch();

  return useQuery(['app-config'], async () => {
    try {
      const response = await getAppConfig();
      if (response.data.btcApiURL && network.type === 'Mainnet' && !btcApiUrl) {
        const updatedNetwork = { ...network, btcApiUrl: response.data.btcApiURL };
        dispatch(ChangeNetworkAction(updatedNetwork, networkAddress || '', ''));
      }
      return response;
    } catch (err) {
      return Promise.reject(err);
    }
  });
};

export default useAppConfig;
