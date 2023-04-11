import BitcoinEsploraApiProvider from '@secretkeylabs/xverse-core/api/esplora/esploraAPiProvider';
import useWalletSelector from './useWalletSelector';

const useBtcClient = () => {
  const { network } = useWalletSelector();
  const esploraInstance = new BitcoinEsploraApiProvider({
    network: network.type,
  });

  return esploraInstance;
};

export default useBtcClient;
