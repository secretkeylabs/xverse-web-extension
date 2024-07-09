import { getOrdinalsServiceApiClient } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from '../useWalletSelector';

const useOrdinalsServiceApi = () => {
  const { network } = useWalletSelector();
  return useMemo(() => getOrdinalsServiceApiClient(network.type), [network.type]);
};

export default useOrdinalsServiceApi;
