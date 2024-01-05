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
        fallbackUrl: 'https://btc-1.xverse.app', // TODO take this from settings input
        network: type,
      }),
    [url, type],
  );

  return esploraInstance;
};

export default useBtcClient;
