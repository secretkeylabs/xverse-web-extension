import { btcTransaction, UtxoCache } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useBtcClient from './apiClients/useBtcClient';
import useSeedVault from './useSeedVault';
import useSelectedAccount from './useSelectedAccount';
import useWalletSelector from './useWalletSelector';

const useTransactionContext = () => {
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const seedVault = useSeedVault();
  const btcClient = useBtcClient();

  const utxoCache = useMemo(
    () =>
      new UtxoCache({
        cacheStorageController: {
          getAllKeys: async () => Object.keys(localStorage),
          get: async (key: string) => {
            const value = localStorage.getItem(key);
            return value;
          },
          set: async (key: string, value: string) => {
            localStorage.setItem(key, value);
          },
          remove: async (key: string) => {
            localStorage.removeItem(key);
          },
        },
        network: network.type,
      }),
    [network.type],
  );

  const transactionContext = useMemo(() => {
    if (selectedAccount?.id === undefined) {
      throw new Error('No account selected');
    }

    return btcTransaction.createTransactionContext({
      account: selectedAccount,
      seedVault,
      utxoCache,
      network: network.type,
      esploraApiProvider: btcClient,
    });
  }, [utxoCache, selectedAccount, network, seedVault, btcClient]);

  return transactionContext;
};

export default useTransactionContext;
