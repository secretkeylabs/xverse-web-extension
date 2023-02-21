import { StacksMainnet, StacksTestnet } from '@secretkeylabs/xverse-core';
import useWalletSelector from './useWalletSelector';

const useNetworkSelector = () => {
  const { network, networkAddress } = useWalletSelector();
  const selectedNetwork = network.type === 'Mainnet'
    ? new StacksMainnet({ url: networkAddress })
    : new StacksTestnet({ url: networkAddress });
  return selectedNetwork;
};

export default useNetworkSelector;
