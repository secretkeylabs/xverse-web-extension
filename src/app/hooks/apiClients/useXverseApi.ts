import { getXverseApiClient } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from '../useWalletSelector';

const useXverseApi = () => {
  const { network } = useWalletSelector();
  return useMemo(() => getXverseApiClient(network.type), [network.type]);
};

export default useXverseApi;
