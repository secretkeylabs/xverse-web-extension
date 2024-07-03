import { OrdinalsApi } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from '../useWalletSelector';

const useOrdinalsApi = () => {
  const { network } = useWalletSelector();
  return useMemo(
    () =>
      new OrdinalsApi({
        network: network.type,
      }),
    [network.type],
  );
};

export default useOrdinalsApi;
