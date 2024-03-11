import { RunesApi } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from './useWalletSelector';

const useRunesApi = () => {
  const { network } = useWalletSelector();
  return useMemo(() => new RunesApi(network.type), [network.type]);
};

export default useRunesApi;
