import { useEffect, useMemo } from 'react';
import BitcoinEsploraApiProvider from '@secretkeylabs/xverse-core/api/esplora/esploraAPiProvider';
import useWalletSelector from './useWalletSelector';
import useAppConfig from './queries/useAppConfig';

const useBtcClient = () => {
  const { network, btcApiUrl } = useWalletSelector();
  useAppConfig();

  const esploraInstance = useMemo(
    () => new BitcoinEsploraApiProvider({
      url: btcApiUrl,
      network: network.type,
    }),
    [btcApiUrl, network.type],
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
          config.baseURL = network.btcApiUrl;
          return config;
        },
        (error) => Promise.reject(error),
      );
    }
  }, [btcApiUrl, network.btcApiUrl]);

  return esploraInstance;
};

export default useBtcClient;
