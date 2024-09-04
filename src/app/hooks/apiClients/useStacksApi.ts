import useNetworkSelector from '@hooks/useNetwork';
import { StacksApiProvider } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';

const useStacksAPI = () => {
  const network = useNetworkSelector();

  const StacksAPI = useMemo(
    () =>
      new StacksApiProvider({
        network,
      }),
    [network],
  );

  return StacksAPI;
};

export default useStacksAPI;
