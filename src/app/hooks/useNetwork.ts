import { StacksMainnet, StacksTestnet } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from './useWalletSelector';

const useNetworkSelector = () => {
  const { network } = useWalletSelector();

  const selectedNetwork = useMemo(
    () =>
      network.type === 'Mainnet'
        ? {
            ...StacksMainnet,
            client: {
              baseUrl: network.address,
            },
          }
        : {
            ...StacksTestnet,
            client: {
              baseUrl: network.address,
            },
          },
    [network.type, network.address],
  );
  return selectedNetwork;
};

export default useNetworkSelector;
