import { btcTransaction, UtxoCache, type BtcPaymentType } from '@secretkeylabs/xverse-core';
import { useEffect, useMemo } from 'react';
import useBtcClient from './apiClients/useBtcClient';
import useSelectedAccount from './useSelectedAccount';
import useVault from './useVault';
import useWalletSelector from './useWalletSelector';

const useTransactionContext = (overridePayAddressType?: BtcPaymentType) => {
  const selectedAccount = useSelectedAccount(overridePayAddressType);
  const { network, softwareWallets } = useWalletSelector();
  const vault = useVault();
  const btcClient = useBtcClient();

  // TODO: we can remove this useEffect after a while once the localstorage cache clearance has propagated
  useEffect(() => {
    // we run this once to clean out the old cache that used localStorage
    const localStorageCache = new UtxoCache({
      cacheStorageController: {
        getAllKeys: async () => Object.keys(localStorage),
        get: async () => null,
        getMany: async () => ({}),
        set: async () => {},
        remove: async (key: string) => {
          localStorage.removeItem(key);
        },
      },
      network: network.type,
      electrsApi: btcClient,
    });
    localStorageCache.clearAllCaches();
  }, []);

  const utxoCache = useMemo(
    () =>
      new UtxoCache({
        cacheStorageController: {
          getAllKeys: async () => {
            const allItems = await chrome.storage.local.get();
            return Object.keys(allItems);
          },
          get: async (key: string) => {
            const value = await chrome.storage.local.get(key);
            return value[key];
          },
          getMany: async <T extends string>(...keys: T[]) => {
            const value = await chrome.storage.local.get(keys);
            return value as Record<T, string | undefined>;
          },
          set: async (key: string, value: string) => {
            await chrome.storage.local.set({
              [key]: value,
            });
          },
          remove: async (key: string) => {
            await chrome.storage.local.remove(key);
          },
          isErrorQuotaExceeded: (error: unknown) =>
            error instanceof Error && error.message.includes('QUOTA_BYTES'),
        },
        network: network.type,
        electrsApi: btcClient,
      }),
    [network.type, btcClient],
  );

  const transactionContext = useMemo(() => {
    if (selectedAccount?.id === undefined) {
      throw new Error('No account selected');
    }

    // TODO: we currently store the master fingerprint in the masterPubKey field for hardware wallets
    // we should not be doing this, but we need to refactor the account model to support this
    const masterFingerprint =
      selectedAccount.accountType === 'software' ? undefined : selectedAccount.masterPubKey;
    const walletId =
      selectedAccount.accountType === 'software' ? selectedAccount.walletId : undefined;

    const softwareWallet = softwareWallets[network.type]?.find(
      (wallet) => wallet.walletId === selectedAccount.walletId,
    );
    const derivationType = softwareWallet?.derivationType || 'index';

    return btcTransaction.createTransactionContext({
      account: selectedAccount,
      seedVault: vault.SeedVault,
      utxoCache,
      network: network.type,
      esploraApiProvider: btcClient,
      btcPaymentAddressType: selectedAccount.btcAddressType,
      masterFingerprint,
      derivationType,
      walletId,
    });
  }, [utxoCache, selectedAccount, network.type, vault, btcClient, softwareWallets]);

  return transactionContext;
};

export default useTransactionContext;
