import { BitcoinEsploraApiProvider } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from './useWalletSelector';

const useBtcClient = () => {
  const { network, btcApiUrl } = useWalletSelector();
  const { type, btcApiUrl: remoteBtcApiURL } = network;
  const url = btcApiUrl || remoteBtcApiURL;

  const esploraInstance = useMemo(
    () =>
      new BitcoinEsploraApiProvider({
        url,
        network: type,
      }),
    [url, type],
  );

  return esploraInstance;
};

export default useBtcClient;
