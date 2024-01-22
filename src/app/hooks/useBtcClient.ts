import { BitcoinEsploraApiProvider } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useWalletSelector from './useWalletSelector';

const useBtcClient = () => {
  const { network } = useWalletSelector();
  const { type, btcApiUrl, fallbackBtcApiUrl } = network;
  const url = btcApiUrl;

  const esploraInstance = useMemo(
    () =>
      new BitcoinEsploraApiProvider({
        url,
        fallbackUrl: fallbackBtcApiUrl,
        network: type,
      }),
    [url, fallbackBtcApiUrl, type],
  );

  return esploraInstance;
};

export default useBtcClient;
