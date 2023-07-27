import { useMemo } from 'react';
import OrdinalsApi from '@secretkeylabs/xverse-core/api/ordinals/provider';
import useWalletSelector from './useWalletSelector';

const useOrdinalsApi = () => {
  const { network } = useWalletSelector();
  return useMemo(
    () =>
      new OrdinalsApi({
        network: network.type,
      }),
    [],
  );
};

export default useOrdinalsApi;
