import { XverseApi } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from '../useWalletSelector';

const useXverseApi = () => {
  const { network } = useWalletSelector();
  return useMemo(() => new XverseApi(network.type), [network.type]);
};

export default useXverseApi;
