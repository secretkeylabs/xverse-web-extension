import getSelectedAccount, { embellishAccountWithDetails } from '@common/utils/getSelectedAccount';
import { getDeviceAccountIndex } from '@common/utils/ledger';
import { dispatchEventAuthorizedConnectedClients } from '@common/utils/messages/extensionToContentScript/dispatchEvent';
import { delay } from '@common/utils/promises';
import { accountPurposeAddresses } from '@common/utils/rpc/btc/getAddresses/utils';
import { getBitcoinNetworkType, getStacksNetworkType } from '@common/utils/rpc/helpers';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import type { WalletEvent } from '@sats-connect/core';
import type { HDKey } from '@scure/bip32';
import {
  AnalyticsEvents,
  BitcoinEsploraApiProvider,
  createWalletAccount,
  getAccountFromRootNode,
  getBnsName,
  mnemonicToRootNode,
  permissions,
  restoreWalletWithAccounts,
  StacksMainnet,
  StacksTestnet,
  type Account,
  type DerivationType,
  type NetworkType,
  type Permissions,
  type SettingsNetwork,
  type StacksNetwork,
  type WalletId,
} from '@secretkeylabs/xverse-core';
import { decryptMnemonic } from '@stacks/encryption';
import { MIGRATED_SAVED_NAMES_KEY, MIGRATION_ACCOUNT_COUNT_KEY } from '@stores/index';
import {
  ChangeBtcPaymentAddressType,
  ChangeNetworkAction,
  changeShowDataCollectionAlertAction,
  resetWalletAction,
  selectAccount,
  setAddingAccountAction,
  setWalletBackupStatusAction,
  setWalletHideStxAction,
  setWalletUnlockedAction,
  storeEncryptedSeedAction,
  updateKeystoneAccountsAction,
  updateLedgerAccountsAction,
  updateSoftwareWalletsAction,
} from '@stores/wallet/actions/actionCreators';
import { useQueryClient } from '@tanstack/react-query';
import { generatePasswordHash } from '@utils/encryptionUtils';
import {
  hasOptedInMixPanelTracking,
  optInMixPanel,
  resetMixPanel,
  trackMixPanel,
} from '@utils/mixpanel';
import { Mutex } from 'async-mutex';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useXverseApi from './apiClients/useXverseApi';
import { useStore } from './useStore';
import useVault from './useVault';
import useWalletSession from './useWalletSession';

const loadAccountsMutex = new Mutex();

const createSingleAccount = async (args: {
  rootNode: HDKey;
  walletId: WalletId;
  derivationIndex: bigint;
  derivationType: DerivationType;
  network: NetworkType;
  stacksNetwork: StacksNetwork;
  accountName: string | undefined;
}) => {
  const derivationParams = {
    accountIndex: 0n,
    index: 0n,
  };

  if (args.derivationType === 'account') {
    derivationParams.accountIndex = args.derivationIndex;
  } else {
    derivationParams.index = args.derivationIndex;
  }

  const { stacksNetwork, accountName, ...generateAccountArgs } = args;
  const account = await getAccountFromRootNode({ ...generateAccountArgs, ...derivationParams });

  account.accountName = accountName;
  account.bnsName = await getBnsName(account.stxAddress, stacksNetwork);

  return account;
};

const useWalletReducer = () => {
  const {
    network,
    encryptedSeed,
    selectedAccountIndex,
    selectedAccountType,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    hideStx,
    selectedWalletId,
    btcPaymentAddressType,
  } = useWalletSelector();
  const vault = useVault();
  const stacksNetwork = useNetworkSelector();
  const currentlySelectedAccount = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    network: network.type,
  });
  const xverseApiClient = useXverseApi();

  const dispatch = useDispatch();
  const { setSessionStartTime, clearSessionTime, setSessionStartTimeAndMigrate } =
    useWalletSession();
  const queryClient = useQueryClient();

  // we use an undefined selector so that we avoid re-rendering as we only use the store for actions
  const accountBalanceStore = useStore('accountBalances', () => undefined);

  /*
   * ensures that the active account is valid by regenerating it and comparing to what's in the store
   * if there is a discrepancy, the store is updated with the correct account
   * this is a security measure to ensure that the account data is always correct
   */
  const ensureSelectedAccountValid = useCallback(
    async (
      selectedAccountTypeLocal = selectedAccountType,
      selectedAccountIndexLocal = selectedAccountIndex,
      selectedWalletIdLocal = selectedWalletId,
      accountListLocal: Account[] | undefined = undefined,
    ): Promise<boolean> => {
      if (selectedAccountTypeLocal !== 'software') {
        // these accounts are created by ledger or keystone, so we cannot regenerate them
        // we do ensure that they are in the auth scope though
        const selectedAccount = getSelectedAccount({
          selectedAccountIndex: selectedAccountIndexLocal,
          selectedAccountType: selectedAccountTypeLocal,
          selectedWalletId: selectedWalletIdLocal,
          softwareWallets,
          ledgerAccountsList,
          keystoneAccountsList,
          network: network.type,
        });

        if (selectedAccount) {
          xverseApiClient.auth.ensureAccountRegistered(selectedAccount);
        }
        return true;
      }

      if (!selectedWalletIdLocal) {
        return false;
      }

      const walletIds = await vault.SeedVault.getWalletIds();
      if (!walletIds.includes(selectedWalletIdLocal)) {
        return false;
      }

      const accountsList =
        accountListLocal ||
        softwareWallets[network.type].find(
          (walletItem) => walletItem.walletId === selectedWalletIdLocal,
        )?.accounts ||
        [];

      const selectedAccount = accountsList.find(
        (account) => account.id === selectedAccountIndexLocal,
      );

      if (!selectedAccount) {
        // if the selected account index does not exist, we cannot update it
        // in this case, the account selection will be reset to the first account elsewhere
        return false;
      }

      const { rootNode, derivationType } = await vault.SeedVault.getWalletRootNode(
        selectedWalletIdLocal,
      );

      const recreatedAccount = await createSingleAccount({
        derivationType,
        derivationIndex: BigInt(selectedAccountIndexLocal),
        rootNode,
        walletId: selectedWalletIdLocal,
        network: network.type,
        stacksNetwork,
        accountName: selectedAccount.accountName,
      });

      xverseApiClient.auth.ensureAccountRegistered(recreatedAccount);

      const accountsMatch = Object.keys(recreatedAccount).every(
        (key) => JSON.stringify(selectedAccount[key]) === JSON.stringify(recreatedAccount[key]),
      );

      if (!accountsMatch) {
        const newAccountsList = accountsList.map((account) =>
          account.id === selectedAccountIndexLocal ? recreatedAccount : account,
        );

        const newSoftwareWallets = softwareWallets[network.type].map((walletItem) =>
          walletItem.walletId === selectedWalletIdLocal
            ? { ...walletItem, accounts: newAccountsList }
            : walletItem,
        );

        dispatch(updateSoftwareWalletsAction(network.type, newSoftwareWallets));
      }

      return true;
    },
    [
      dispatch,
      network.type,
      stacksNetwork,
      vault,
      selectedAccountIndex,
      selectedAccountType,
      softwareWallets,
      selectedWalletId,
    ],
  );

  const loadSoftwareAccounts = async (
    currentNetwork: SettingsNetwork,
    currentStacksNetwork: StacksNetwork,
    options?: {
      resetIndex?: boolean;
      accountLoadCallback?: (loadedAccounts: Account[], walletId: WalletId) => void;
    },
  ) => {
    const release = await loadAccountsMutex.acquire();
    try {
      // TODO multiwallet: This is a temporary method to load accounts with migrations from wallet store v10
      // TODO: remove this method once we have given users a reasonable amount of time to update their wallets
      // TODO: maybe around June 2025
      // !Note: if they update their wallet from v10 with this removed, they will only lose their custom account names
      // !Note: This code is gross. I'm sorry. I'm not proud of it. Let's remove it as soon as possible.

      // these are names of accounts that were saved in an old version of the wallet redux store
      // and placed in local storage for the migration
      // if this value is set, we will restore accounts with these names below and then remove the value
      const migratedSavedNamesStr = localStorage.getItem(MIGRATED_SAVED_NAMES_KEY);
      const migratedSavedNames = migratedSavedNamesStr
        ? (JSON.parse(migratedSavedNamesStr) as {
            [key in NetworkType]?: { id: number; name?: string }[];
          })
        : undefined;
      const maxMigratedId = migratedSavedNames?.[currentNetwork.type]?.reduce((acc, name) => {
        if (name.id > acc) return name.id;
        return acc;
      }, 0);
      // this was the number of accounts migrated in store v10, so we want to regenerate them on first load
      const migratedAccountCountStr =
        currentNetwork.type === 'Mainnet'
          ? localStorage.getItem(MIGRATION_ACCOUNT_COUNT_KEY)
          : undefined;
      let migratedAccountCount = migratedAccountCountStr
        ? parseInt(migratedAccountCountStr, 10)
        : undefined;
      if (maxMigratedId !== undefined) {
        migratedAccountCount = migratedAccountCount
          ? Math.max(maxMigratedId, migratedAccountCount)
          : maxMigratedId;
      }

      // TODO: end

      dispatch(setAddingAccountAction(true));

      let walletIds = await vault.SeedVault.getWalletIds();
      const walletIdSet = new Set(walletIds);

      if (selectedWalletId && walletIds.includes(selectedWalletId)) {
        // move selected walletId to the top of the list so it's loaded first
        walletIds = [selectedWalletId, ...walletIds.filter((id) => id !== selectedWalletId)];
      }

      let softwareWalletsList = softwareWallets[currentNetwork.type];

      const networkBtcClient = new BitcoinEsploraApiProvider({
        url: currentNetwork.btcApiUrl,
        fallbackUrl: currentNetwork.fallbackBtcApiUrl,
        network: currentNetwork.type,
      });

      softwareWalletsList = softwareWalletsList.filter((wallet) =>
        walletIdSet.has(wallet.walletId),
      );

      // eslint-disable-next-line no-restricted-syntax
      for (const walletId of walletIds) {
        const { rootNode, derivationType } = await vault.SeedVault.getWalletRootNode(walletId);

        const savedCustomAccountNames = migratedSavedNames?.[currentNetwork.type];

        const newSoftwareAccountList: Account[] = [];

        const currentAccounts =
          softwareWalletsList.find((walletItem) => walletItem.walletId === walletId)?.accounts ||
          [];

        const walletAccountsGenerator = restoreWalletWithAccounts({
          btcClient: networkBtcClient,
          rootNode,
          walletId,
          derivationType,
          btcNetwork: currentNetwork,
          stacksNetwork: currentStacksNetwork,
          currentAccounts,
          checkForNewAccountLimit: 1,
          generatorMode: true,
          minimumAccountsListLength: migratedAccountCount || 1,
        });

        let newAccountResponse = await walletAccountsGenerator.next();

        while (!newAccountResponse.done) {
          const newAccount = newAccountResponse.value;
          if (savedCustomAccountNames?.length) {
            const savedAccount = savedCustomAccountNames.find((acc) => acc.id === newAccount.id);
            if (savedAccount) {
              newAccount.accountName = savedAccount.name;
            }
          }
          newSoftwareAccountList.push(newAccount);

          if (newSoftwareAccountList.length >= (currentAccounts.length || 1)) {
            // we've regenerated the existing accounts, so we can update the store before continuing
            const wallet = softwareWalletsList.find(
              (walletItem) => walletItem.walletId === walletId,
            );

            if (wallet) {
              softwareWalletsList = softwareWalletsList.map((walletItem) =>
                walletItem === wallet
                  ? { ...wallet, accounts: [...newSoftwareAccountList] }
                  : walletItem,
              );
            } else {
              softwareWalletsList.push({
                walletId,
                derivationType,
                accounts: [...newSoftwareAccountList],
              });
            }
            dispatch(updateSoftwareWalletsAction(currentNetwork.type, softwareWalletsList));

            if (options?.accountLoadCallback) {
              await options.accountLoadCallback([...newSoftwareAccountList], walletId);
            }

            // since we've already loaded the existing accounts, we can now check for new accounts, but with a small delay
            // to not overload the backends
            await delay(100);
          }

          newAccountResponse = await walletAccountsGenerator.next();
        }
      }

      // ledger accounts initially didn't have a deviceAccountIndex
      // this is a migration to add the deviceAccountIndex to the ledger accounts without them
      // it should only fire once if ever
      if (ledgerAccountsList.some((account) => account.deviceAccountIndex === undefined)) {
        const newLedgerAccountsList = ledgerAccountsList.map((account) => ({
          ...account,
          deviceAccountIndex: getDeviceAccountIndex(
            ledgerAccountsList,
            account.id,
            account.masterPubKey,
          ),
        }));
        dispatch(updateLedgerAccountsAction(newLedgerAccountsList));
      }

      if (options?.resetIndex) {
        dispatch(selectAccount(0, 'software', walletIds[0]));
      }

      // TODO: Remove below with TODO from top of function
      if (migratedSavedNames) {
        delete migratedSavedNames[currentNetwork.type];

        if (Object.values(migratedSavedNames).some((names) => names.length > 0)) {
          localStorage.setItem(MIGRATED_SAVED_NAMES_KEY, JSON.stringify(migratedSavedNames));
        } else {
          localStorage.removeItem(MIGRATED_SAVED_NAMES_KEY);
        }
      }

      if (currentNetwork.type === 'Mainnet' && migratedAccountCount !== undefined) {
        localStorage.removeItem(MIGRATION_ACCOUNT_COUNT_KEY);
      }
    } finally {
      dispatch(setAddingAccountAction(false));
      release();
    }
  };

  const migrateLegacySeedStorage = async (password: string) => {
    const pHash = await generatePasswordHash(password);
    await decryptMnemonic(encryptedSeed, pHash.hash).then(async (decrypted) => {
      await vault.initialise(password);
      await vault.SeedVault.storeWalletByMnemonic(decrypted, 'index');
      localStorage.removeItem('salt');
      dispatch(storeEncryptedSeedAction(''));
    });
  };

  const loadWallet = async (onReady?: () => void) => {
    let initialised = false;

    const initialise = async () => {
      if (initialised) return;

      onReady?.();
      dispatch(setWalletUnlockedAction(true));
      await setSessionStartTimeAndMigrate();
      initialised = true;
    };

    const walletAccountCount =
      softwareWallets[network.type].find((wallet) => wallet.walletId === selectedWalletId)?.accounts
        .length || 1;

    await loadSoftwareAccounts(network, stacksNetwork, {
      accountLoadCallback: async (loadedAccounts, walletId) => {
        if (
          (!selectedWalletId || selectedWalletId === walletId) &&
          loadedAccounts.length === walletAccountCount
        ) {
          const selectedAccountValid = await ensureSelectedAccountValid(
            undefined,
            undefined,
            undefined,
            loadedAccounts,
          );
          if (!selectedAccountValid) {
            const firstAccount = loadedAccounts[0];
            dispatch(selectAccount(firstAccount.id, 'software', firstAccount.walletId));
          }
          await initialise();
        }
      },
    });

    await initialise();
  };

  const unlockWallet = async (password: string) => {
    if (encryptedSeed && encryptedSeed.length > 0) {
      await migrateLegacySeedStorage(password);
      return;
    }
    await vault.unlockVault(password);

    loadWallet();
  };

  const lockWallet = async () => {
    dispatch(setWalletUnlockedAction(false));
    if (await vault.isVaultUnlocked()) {
      await vault.lockVault();
    }
  };

  const toggleStxVisibility = async () => {
    dispatch(setWalletHideStxAction(!hideStx));
  };

  const changeShowDataCollectionAlert = (showDataCollectionAlertUpdate = false) => {
    dispatch(changeShowDataCollectionAlertAction(showDataCollectionAlertUpdate));
  };

  const resetWallet = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();

    resetMixPanel();
    dispatch(resetWalletAction());
    localStorage.clear();
    queryClient.clear();
    await Promise.all([
      clearSessionTime(),
      chrome.storage.local.clear(),
      chrome.storage.session.clear(),
    ]);
  };

  const updateSoftwareWalletAccounts = async (walletId: WalletId, updatedAccount: Account) => {
    if (updatedAccount.accountType !== 'software') {
      throw new Error('Expected software account.');
    }

    const softwareAccountsList = softwareWallets[network.type].find(
      (walletItem) => walletItem.walletId === walletId,
    )?.accounts;

    if (!softwareAccountsList) {
      throw new Error('Software wallet not found. Cannot update account.');
    }

    const newAccountsList = softwareAccountsList.map((account) =>
      account.id === updatedAccount.id ? updatedAccount : account,
    );

    const newSoftwareWallets = softwareWallets[network.type].map((walletItem) =>
      walletItem.walletId === walletId ? { ...walletItem, accounts: newAccountsList } : walletItem,
    );

    dispatch(updateSoftwareWalletsAction(network.type, newSoftwareWallets));
  };

  const initialiseSeedVault = async (
    mnemonic: string,
    password: string,
    derivationType: DerivationType,
  ): Promise<WalletId> => {
    // We create an account to ensure that the seed phrase is valid, but we don't store it
    // The actual account creation is done on startup of the wallet
    // If the seed phrase is invalid, then this will throw an error
    const rootNode = await mnemonicToRootNode(mnemonic);
    const firstAccount = await createSingleAccount({
      rootNode,
      walletId: 'default' as WalletId,
      derivationIndex: 0n,
      derivationType,
      network: 'Mainnet',
      stacksNetwork: StacksMainnet,
      accountName: undefined,
    });

    await chrome.storage.local.clear();
    await chrome.storage.session.clear();

    await vault.initialise(password);
    const walletId = await vault.SeedVault.storeWalletByMnemonic(mnemonic, derivationType);

    firstAccount.walletId = walletId;
    dispatch(
      updateSoftwareWalletsAction('Mainnet', [
        { walletId, derivationType, accounts: [firstAccount] },
      ]),
    );
    dispatch(selectAccount(firstAccount.id, 'software', walletId));

    // reinitialise with masterpubkey hash now that we have it
    if (hasOptedInMixPanelTracking()) {
      optInMixPanel(firstAccount.masterPubKey);
    }

    localStorage.setItem('migrated', 'true');
    await setSessionStartTime();

    return walletId;
  };

  const restoreWallet = async (
    mnemonic: string,
    password: string,
    derivationType: DerivationType,
  ): Promise<WalletId> => {
    const walletId = await initialiseSeedVault(mnemonic, password, derivationType);
    trackMixPanel(AnalyticsEvents.RestoreWallet, { backupType: 'manual' });
    return walletId;
  };

  const createWallet = async (
    password: string,
    mnemonic: string,
    derivationType: DerivationType,
    hasBackedUpWallet: boolean,
  ): Promise<WalletId> => {
    const walletId = await initialiseSeedVault(mnemonic, password, derivationType);

    dispatch(setWalletBackupStatusAction(hasBackedUpWallet));
    trackMixPanel(AnalyticsEvents.CreateNewWallet, { has_backed_up_wallet: hasBackedUpWallet });
    return walletId;
  };

  const createSoftwareAccount = async (walletId: WalletId) => {
    dispatch(setAddingAccountAction(true));
    const { rootNode, derivationType } = await vault.SeedVault.getWalletRootNode(walletId);
    const wallet = softwareWallets[network.type].find(
      (walletItem) => walletItem.walletId === walletId,
    );
    const newAccounts = await createWalletAccount(
      rootNode,
      walletId,
      network,
      stacksNetwork,
      wallet?.accounts || [],
      derivationType,
    );
    const newSoftwareWallets = softwareWallets[network.type].map((walletItem) =>
      walletItem.walletId === walletId ? { ...walletItem, accounts: newAccounts } : walletItem,
    );
    dispatch(updateSoftwareWalletsAction(network.type, newSoftwareWallets));
    dispatch(setAddingAccountAction(false));
  };

  const switchAccount = useCallback(
    async (nextAccount: Account) => {
      // we clear the query cache to prevent data from the other account potentially being displayed
      await queryClient.cancelQueries();
      queryClient.clear();

      ensureSelectedAccountValid(nextAccount.accountType, nextAccount.id, nextAccount.walletId);

      dispatch(selectAccount(nextAccount.id, nextAccount.accountType, nextAccount.walletId));

      const targetAccountId = permissions.utils.account.makeAccountId({
        accountId: nextAccount.id,
        networkType: network.type,
        masterPubKey: nextAccount.masterPubKey,
      });

      if (currentlySelectedAccount) {
        const currentAccountId = permissions.utils.account.makeAccountId({
          accountId: currentlySelectedAccount.id,
          networkType: network.type,
          masterPubKey: currentlySelectedAccount.masterPubKey,
        });
        const currentAccountEventPermissions: Omit<Permissions.Store.Permission, 'clientId'>[] = [
          {
            type: 'account',
            resourceId: permissions.resources.account.makeAccountResourceId(currentAccountId),
            actions: { read: true },
          },
        ];

        dispatchEventAuthorizedConnectedClients(currentAccountEventPermissions, {
          type: 'accountChange',
          addresses: [],
        });
      }

      const targetAccountEventPermissions: Omit<Permissions.Store.Permission, 'clientId'>[] = [
        {
          type: 'account',
          resourceId: permissions.resources.account.makeAccountResourceId(targetAccountId),
          actions: { read: true },
        },
      ];

      const embellishedAccount = embellishAccountWithDetails(nextAccount, btcPaymentAddressType);

      dispatchEventAuthorizedConnectedClients(targetAccountEventPermissions, {
        type: 'accountChange',
        addresses: accountPurposeAddresses(embellishedAccount, { type: 'all' }),
      });
    },
    [dispatch, ensureSelectedAccountValid, network.type, queryClient, currentlySelectedAccount],
  );

  const changeNetwork = async (changedNetwork: SettingsNetwork) => {
    // we clear the query cache to prevent data from the other account potentially being displayed
    await queryClient.cancelQueries();
    queryClient.clear();
    await accountBalanceStore.actions.reset();

    dispatch(ChangeNetworkAction(changedNetwork));

    const changedStacksNetwork: StacksNetwork =
      changedNetwork.type === 'Mainnet'
        ? {
            ...StacksMainnet,
            client: {
              baseUrl: changedNetwork.address,
            },
          }
        : {
            ...StacksTestnet,
            client: {
              baseUrl: changedNetwork.address,
            },
          };

    return new Promise<void>((resolve, reject) => {
      loadSoftwareAccounts(changedNetwork, changedStacksNetwork, {
        resetIndex: true,
        accountLoadCallback: async (loadedAccounts) => {
          resolve();
          const selectedAccountId = currentlySelectedAccount?.id;
          const selectedAccountFromLoadedAccounts = loadedAccounts.find(
            (account) => account.id === selectedAccountId,
          );

          const baseNetworkChangeEvent: WalletEvent = {
            type: 'networkChange',
            bitcoin: {
              name: getBitcoinNetworkType(changedNetwork.type),
            },
            stacks: {
              name: getStacksNetworkType(changedNetwork.type),
            },
            addresses: [],
          };

          const networkPermission: Omit<Permissions.Store.Permission, 'clientId'>[] = [
            {
              type: 'wallet',
              actions: {
                readNetwork: true,
              },
              resourceId: 'wallet',
            },
          ];
          dispatchEventAuthorizedConnectedClients(networkPermission, baseNetworkChangeEvent);
          if (selectedAccountFromLoadedAccounts) {
            const targetAccountId = permissions.utils.account.makeAccountId({
              accountId: selectedAccountFromLoadedAccounts.id,
              networkType: network.type,
              masterPubKey: selectedAccountFromLoadedAccounts.masterPubKey,
            });
            const targetAccountEventPermissions: Omit<Permissions.Store.Permission, 'clientId'>[] =
              [
                {
                  type: 'account',
                  resourceId: permissions.resources.account.makeAccountResourceId(targetAccountId),
                  actions: { read: true },
                },
              ];
            const networkAndAccountPermission = [
              ...networkPermission,
              ...targetAccountEventPermissions,
            ];
            const embellishedAccount = embellishAccountWithDetails(
              selectedAccountFromLoadedAccounts,
              btcPaymentAddressType,
            );
            dispatchEventAuthorizedConnectedClients(networkAndAccountPermission, {
              ...baseNetworkChangeEvent,
              addresses: accountPurposeAddresses(embellishedAccount, { type: 'all' }),
            });
          }
        },
      }).catch(reject);
    });
  };

  const addLedgerAccount = async (ledgerAccount: Account) => {
    dispatch(updateLedgerAccountsAction([...ledgerAccountsList, ledgerAccount]));
  };

  const removeLedgerAccount = async (ledgerAccount: Account) => {
    dispatch(
      updateLedgerAccountsAction(
        ledgerAccountsList.filter((account) => account.id !== ledgerAccount.id),
      ),
    );
  };

  const updateLedgerAccounts = async (updatedLedgerAccount: Account) => {
    if (updatedLedgerAccount.accountType !== 'ledger') {
      throw new Error('Expected ledger account. Update cancelled.');
    }

    const newLedgerAccountsList = ledgerAccountsList.map((account) =>
      account.id === updatedLedgerAccount.id ? updatedLedgerAccount : account,
    );

    dispatch(updateLedgerAccountsAction(newLedgerAccountsList));
  };

  const addKeystoneAccount = async (keystoneAccount: Account) => {
    dispatch(updateKeystoneAccountsAction([...keystoneAccountsList, keystoneAccount]));
  };

  const removeKeystoneAccount = async (keystoneAccount: Account) => {
    dispatch(
      updateKeystoneAccountsAction(
        keystoneAccountsList.filter((account) => account.id !== keystoneAccount.id),
      ),
    );
  };

  const updateKeystoneAccounts = async (updatedKeystoneAccount: Account) => {
    if (updatedKeystoneAccount.accountType !== 'keystone') {
      throw new Error('Expected keystone account. Update cancelled.');
    }

    const newKeystoneAccountsList = keystoneAccountsList.map((account) =>
      account.id === updatedKeystoneAccount.id ? updatedKeystoneAccount : account,
    );

    dispatch(updateKeystoneAccountsAction(newKeystoneAccountsList));
  };

  const changeBtcPaymentAddressType = async (newBtcPaymentAddressType: 'native' | 'nested') => {
    dispatch(ChangeBtcPaymentAddressType(newBtcPaymentAddressType));
    if (currentlySelectedAccount) {
      const embellishedAccount = embellishAccountWithDetails(
        currentlySelectedAccount,
        newBtcPaymentAddressType,
      );
      dispatchEventAuthorizedConnectedClients(
        [
          {
            type: 'account',
            resourceId: permissions.resources.account.makeAccountResourceId(
              permissions.utils.account.makeAccountId({
                accountId: currentlySelectedAccount.id,
                masterPubKey: currentlySelectedAccount.masterPubKey,
                networkType: network.type,
              }),
            ),
            actions: { read: true },
          },
        ],
        {
          type: 'accountChange',
          addresses: accountPurposeAddresses(embellishedAccount, { type: 'all' }),
        },
      );
    }
  };

  return {
    unlockWallet,
    loadWallet,
    lockWallet,
    resetWallet,
    restoreWallet,
    createWallet,
    switchAccount,
    changeNetwork,
    createSoftwareAccount,
    addLedgerAccount,
    removeLedgerAccount,
    updateLedgerAccounts,
    addKeystoneAccount,
    removeKeystoneAccount,
    updateKeystoneAccounts,
    updateSoftwareWalletAccounts,
    toggleStxVisibility,
    changeShowDataCollectionAlert,
    changeBtcPaymentAddressType,
  };
};

export default useWalletReducer;
