import { StacksMainnet, StacksTestnet } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from './useWalletSelector';

const useNetworkSelector = () => {
  const { network, networkAddress } = useWalletSelector();

  const selectedNetwork = useMemo(
    () => (network.type === 'Mainnet'
      ? new StacksMainnet({ url: networkAddress })
      : new StacksTestnet({ url: networkAddress })),
    [network.type, networkAddress],
  );
  return selectedNetwork;
};

export default useNetworkSelector;
