import { BitcoinEsploraApiProvider } from '@secretkeylabs/xverse-core';
import { useEffect, useMemo } from 'react';
import useWalletSelector from './useWalletSelector';

const useBtcClient = () => {
  const { network, btcApiUrl } = useWalletSelector();
  const { type, btcApiUrl: remoteBtcApiURL } = network;

  const esploraInstance = useMemo(
    () =>
      new BitcoinEsploraApiProvider({
        url: remoteBtcApiURL,
        network: type,
      }),
    [btcApiUrl, type, remoteBtcApiURL],
  );

  useEffect(() => {
    if (btcApiUrl) {
      esploraInstance.bitcoinApi.interceptors.request.use(
        async (config) => {
          config.baseURL = btcApiUrl;
          return config;
        },
        (error) => Promise.reject(error),
      );
    } else {
      esploraInstance.bitcoinApi.interceptors.request.use(
        async (config) => {
          config.baseURL = remoteBtcApiURL;
          return config;
        },
        (error) => Promise.reject(error),
      );
    }
  }, [btcApiUrl, remoteBtcApiURL]);

  return esploraInstance;
};

export default useBtcClient;
