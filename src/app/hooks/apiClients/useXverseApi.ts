import useVault from '@hooks/useVault';
import { XverseApi } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from '../useWalletSelector';

const useXverseApi = () => {
  const { network } = useWalletSelector();
  const vault = useVault();
  return useMemo(() => new XverseApi(vault, network.type), [vault, network.type]);
};

export default useXverseApi;
