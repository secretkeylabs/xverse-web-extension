import { getRunesClient } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from './useWalletSelector';

const useRunesApi = () => {
  const { network } = useWalletSelector();
  return useMemo(() => getRunesClient(network.type), [network.type]);
};

export default useRunesApi;
