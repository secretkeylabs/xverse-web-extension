import { StacksMainnet, StacksTestnet } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from './useWalletSelector';

const useNetworkSelector = () => {
  const { network } = useWalletSelector();

  const selectedNetwork = useMemo(
    () =>
      network.type === 'Mainnet'
        ? new StacksMainnet({ url: network.address })
        : new StacksTestnet({ url: network.address }),
    [network.type, network.address],
  );
  return selectedNetwork;
};

export default useNetworkSelector;
