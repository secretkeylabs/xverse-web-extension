import getSelectedAccount from '@common/utils/getSelectedAccount';
import { getDeviceAccountIndex } from '@common/utils/ledger';
import { dispatchEventAuthorizedConnectedClients } from '@common/utils/messages/extensionToContentScript/dispatchEvent';
import { delay } from '@common/utils/promises';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  AnalyticsEvents,
  createWalletAccount,
  decryptSeedPhraseCBC,
  getAccountFromSeedPhrase,
  getBnsName,
  permissions,
  restoreWalletWithAccounts,
  StacksMainnet,
  StacksNetwork,
  StacksTestnet,
  type Account,
  type NetworkType,
  type Permissions,
  type SettingsNetwork,
} from '@secretkeylabs/xverse-core';
import {
  ChangeBtcPaymentAddressType,
  ChangeNetworkAction,
  changeShowDataCollectionAlertAction,
  EnableNestedSegWitAddress,
  resetWalletAction,
  selectAccount,
  setWalletHideStxAction,
  setWalletUnlockedAction,
  storeEncryptedSeedAction,
  updateLedgerAccountsAction,
  updateSavedNamesAction,
  updateSoftwareAccountsAction,
} from '@stores/wallet/actions/actionCreators';
import { useQueryClient } from '@tanstack/react-query';
import { generatePasswordHash } from '@utils/encryptionUtils';
import {
  hasOptedInMixPanelTracking,
  optInMixPanel,
  resetMixPanel,
  trackMixPanel,
} from '@utils/mixpanel';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useBtcClient from './apiClients/useBtcClient';
import useSeedVault from './useSeedVault';
import useWalletSession from './useWalletSession';

const createSingleAccount = async (
  seedPhrase: string,
  accountIndex: number,
  btcNetwork: NetworkType,
  stacksNetwork: StacksNetwork,
  savedNames: { id: number; name?: string }[] = [],
) => {
  const account = await getAccountFromSeedPhrase({
    mnemonic: seedPhrase,
    index: BigInt(accountIndex),
    network: btcNetwork,
  });
  account.accountName = savedNames.find((name) => name.id === accountIndex)?.name;
  account.bnsName = await getBnsName(account.stxAddress, stacksNetwork);

  return account;
};

const useWalletReducer = () => {
  const {
    network,
    encryptedSeed,
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    savedNames,
    ledgerAccountsList,
    showDataCollectionAlert,
    hideStx,
  } = useWalletSelector();
  const seedVault = useSeedVault();
  const stacksNetwork = useNetworkSelector();
  const currentlySelectedAccount = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
  });
  const btcClient = useBtcClient();

  const dispatch = useDispatch();
  const { setSessionStartTime, clearSessionTime, setSessionStartTimeAndMigrate } =
    useWalletSession();
  const queryClient = useQueryClient();

  const ensureSelectedAccountValid = useCallback(
    async (
      selectedType = selectedAccountType,
      selectedIndex = selectedAccountIndex,
      accountsList = softwareAccountsList,
    ): Promise<void> => {
      if (selectedType === 'ledger') {
        // these accounts are created by Ledger, so we cannot regenerate them
        return;
      }

      const seedPhrase = await seedVault.getSeed();
      const recreatedAccount = await createSingleAccount(
        seedPhrase,
        selectedIndex,
        network.type,
        stacksNetwork,
        savedNames[network.type],
      );

      const selectedAccount = accountsList.find((account) => account.id === selectedIndex);

      if (!selectedAccount) {
        // if the selected account index does not exist, we cannot update it
        // in this case, the account selection will be reset to the first account elsewhere
        return;
      }

      const accountsMatch = Object.keys(recreatedAccount).every(
        (key) => JSON.stringify(selectedAccount[key]) === JSON.stringify(recreatedAccount[key]),
      );

      if (!accountsMatch) {
        const newAccountsList = accountsList.map((account) =>
          account.id === selectedIndex ? recreatedAccount : account,
        );

        dispatch(updateSoftwareAccountsAction(newAccountsList));
      }
    },
    [
      dispatch,
      network.type,
      stacksNetwork,
      seedVault,
      selectedAccountIndex,
      selectedAccountType,
      softwareAccountsList,
      savedNames,
    ],
  );

  const loadActiveAccounts = async (
    secretKey: string,
    currentNetwork: SettingsNetwork,
    currentStacksNetwork: StacksNetwork,
    currentAccounts: Account[],
    options?: {
      resetIndex?: boolean;
      checkForNewAccounts?: boolean;
      accountLoadCallback?: (loadedAccounts: Account[]) => void;
    },
  ) => {
    const newSoftwareAccountList: Account[] = [];

    // Load custom account names for the new network
    const savedCustomAccountNames = savedNames[currentNetwork.type];

    const walletAccountsGenerator = restoreWalletWithAccounts(
      btcClient,
      secretKey,
      currentNetwork,
      currentStacksNetwork,
      currentAccounts,
      options?.checkForNewAccounts ? 1 : 0,
      true,
    );

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

      if (newSoftwareAccountList.length >= currentAccounts.length) {
        // we've regenerated the existing accounts, so we can update the store before continuing
        dispatch(updateSoftwareAccountsAction([...newSoftwareAccountList]));

        if (options?.accountLoadCallback) {
          await options.accountLoadCallback([...newSoftwareAccountList]);
        }

        // since we've already loaded the existing accounts, we can now check for new accounts, but with a small delay
        // to not overload the backends
        await delay(100);
      }

      newAccountResponse = await walletAccountsGenerator.next();
    }

    const finalNewAccountsList = newAccountResponse.value;
    dispatch(updateSoftwareAccountsAction(finalNewAccountsList));

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
      dispatch(selectAccount(finalNewAccountsList[0]));
    }
  };

  const migrateLegacySeedStorage = async (password: string) => {
    const pHash = await generatePasswordHash(password);
    await decryptSeedPhraseCBC(encryptedSeed, pHash.hash).then(async (decrypted) => {
      await seedVault.storeSeed(decrypted, password);
      localStorage.removeItem('salt');
      dispatch(storeEncryptedSeedAction(''));
    });
  };

  const loadAccountNames = () => {
    const updatedSavedNames = softwareAccountsList.reduce<{ id: number; name: string }[]>(
      (acc, account) => {
        if (account.accountName) {
          acc.push({ id: account.id, name: account.accountName });
        }
        return acc;
      },
      [],
    );
    dispatch(updateSavedNamesAction(network.type, updatedSavedNames));
  };

  const loadWallet = async (onReady?: () => void) => {
    const seedPhrase = await seedVault.getSeed();
    let currentAccounts = softwareAccountsList || [];

    if (currentAccounts.length === 0) {
      // This will happen on first load after the wallet is created. We create the accounts here to ensure
      // the wallet seed phrase is finalised and in the vault before we create the accounts.
      // We create one account to ensure the wallet is functional on load, if there were others, they will
      // get populated in the loadActiveAccounts method.
      const account = await createSingleAccount(
        seedPhrase,
        0,
        network.type,
        stacksNetwork,
        savedNames[network.type],
      );

      currentAccounts = [account];
    }

    // we need to generate the nested and native segwit address for each account if not yet generated
    // this would happen on the first load after native segwit was added
    const accountsHaveFullAddressData = currentAccounts.every(
      (account) => account.btcAddresses.native && account.btcAddresses.nested,
    );

    if (!accountsHaveFullAddressData) {
      currentAccounts = await Promise.all(
        currentAccounts.map(async (account) => {
          if (!account.btcAddresses.native || !account.btcAddresses.nested) {
            const updatedAccount = await createSingleAccount(
              seedPhrase,
              account.id,
              network.type,
              stacksNetwork,
              savedNames[network.type],
            );

            return updatedAccount;
          }

          return account;
        }),
      );
    }

    if (
      !savedNames[network.type]?.length &&
      softwareAccountsList.some((account) => !!account.accountName)
    ) {
      // there was no savedNames store object initially
      // this is a migration to add the savedNames if there are custom account names that are not saved
      // it should only fire once if ever
      loadAccountNames();
    }

    let initialised = false;
    const initialise = () => {
      if (initialised) return;

      onReady?.();
      dispatch(setWalletUnlockedAction(true));
      setSessionStartTimeAndMigrate();
      initialised = true;
    };

    await loadActiveAccounts(seedPhrase, network, stacksNetwork, currentAccounts, {
      checkForNewAccounts: network.type === 'Mainnet',
      accountLoadCallback: async (loadedAccounts) => {
        if (loadedAccounts.length === currentAccounts.length) {
          await ensureSelectedAccountValid(undefined, undefined, loadedAccounts);
          initialise();
        }
      },
    });

    initialise();
  };

  const unlockWallet = async (password: string) => {
    if (encryptedSeed && encryptedSeed.length > 0) {
      await migrateLegacySeedStorage(password);
      return;
    }
    await seedVault.unlockVault(password);

    loadWallet();
  };

  const lockWallet = async () => {
    dispatch(setWalletUnlockedAction(false));
    if (await seedVault.isVaultUnlocked()) {
      await seedVault.lockVault();
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

  const initialiseSeedVault = async (seedPhrase: string, password: string) => {
    // We create an account to ensure that the seed phrase is valid, but we don't store it
    // The actual account creation is done on startup of the wallet
    // If the seed phrase is invalid, then this will throw an error
    await createSingleAccount(seedPhrase, 0, network.type, stacksNetwork, savedNames[network.type]);

    await chrome.storage.local.clear();
    await chrome.storage.session.clear();

    await seedVault.storeSeed(seedPhrase, password);

    // since we cleared up storage above, the store won't be populated in storage
    // and the selected value of showDataCollectionAlert will be lost
    // we need to set it back here, making sure it changes so that redux-persist will save it
    if (showDataCollectionAlert !== null && showDataCollectionAlert !== undefined) {
      changeShowDataCollectionAlert(!showDataCollectionAlert);
      changeShowDataCollectionAlert(showDataCollectionAlert);

      // reinitialise with masterpubkey hash now that we have it
      if (hasOptedInMixPanelTracking()) {
        const seed = await seedVault.getSeed();
        const account = await getAccountFromSeedPhrase({
          mnemonic: seed,
          index: 0n,
          network: 'Mainnet',
        });
        optInMixPanel(account.masterPubKey);
      }
    }
    localStorage.setItem('migrated', 'true');
    setSessionStartTime();
  };

  const restoreWallet = async (seedPhrase: string, password: string) => {
    await initialiseSeedVault(seedPhrase, password);

    trackMixPanel(AnalyticsEvents.RestoreWallet);
  };

  const createWallet = async (seedPhrase: string, password: string) => {
    await initialiseSeedVault(seedPhrase, password);

    trackMixPanel(AnalyticsEvents.CreateNewWallet);
  };

  const createAccount = async () => {
    const seedPhrase = await seedVault.getSeed();
    const newAccounts = await createWalletAccount(
      seedPhrase,
      network,
      stacksNetwork,
      softwareAccountsList,
    );
    dispatch(updateSoftwareAccountsAction(newAccounts));
  };

  const switchAccount = useCallback(
    async (nextAccount: Account) => {
      // we clear the query cache to prevent data from the other account potentially being displayed
      await queryClient.cancelQueries();
      queryClient.clear();

      await ensureSelectedAccountValid(nextAccount.accountType, nextAccount.id);

      dispatch(selectAccount(nextAccount));

      const accountId = permissions.utils.account.makeAccountId({
        accountId: nextAccount.id,
        networkType: network.type,
        masterPubKey: nextAccount.masterPubKey,
      });
      const changeEventPermissions: Omit<Permissions.Store.Permission, 'clientId'>[] = [
        {
          type: 'account',
          resourceId: permissions.resources.account.makeAccountResourceId(accountId),
          actions: { read: true },
        },
      ];
      if (currentlySelectedAccount) {
        const currentAccountId = permissions.utils.account.makeAccountId({
          accountId: currentlySelectedAccount.id,
          networkType: network.type,
          masterPubKey: currentlySelectedAccount.masterPubKey,
        });
        changeEventPermissions.push({
          type: 'account',
          resourceId: permissions.resources.account.makeAccountResourceId(currentAccountId),
          actions: { read: true },
        });
      }

      dispatchEventAuthorizedConnectedClients(changeEventPermissions, { type: 'accountChange' });
    },
    [dispatch, ensureSelectedAccountValid, network.type, queryClient, currentlySelectedAccount],
  );

  const changeNetwork = async (changedNetwork: SettingsNetwork) => {
    // Save current custom account names
    const currentNetworkType = network.type;
    const customAccountNames = softwareAccountsList.map((account) => ({
      id: account.id,
      name: account.accountName,
    }));
    dispatch(updateSavedNamesAction(currentNetworkType, customAccountNames));

    // we clear the query cache to prevent data from the other account potentially being displayed
    await queryClient.cancelQueries();
    queryClient.clear();

    dispatch(ChangeNetworkAction(changedNetwork));

    if (currentlySelectedAccount) {
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
          {
            type: 'account',
            resourceId: permissions.resources.account.makeAccountResourceId(
              permissions.utils.account.makeAccountId({
                accountId: currentlySelectedAccount.id,
                masterPubKey: currentlySelectedAccount.masterPubKey,
                networkType: changedNetwork.type,
              }),
            ),
            actions: { read: true },
          },
        ],
        { type: 'networkChange' },
      );
    }

    const seedPhrase = await seedVault.getSeed();
    const changedStacksNetwork =
      changedNetwork.type === 'Mainnet'
        ? new StacksMainnet({ url: changedNetwork.address })
        : new StacksTestnet({ url: changedNetwork.address });

    const nextAccounts: Account[] = [];

    // we recreate the same number of accounts on the new network
    for (let i = 0; i < softwareAccountsList.length; i++) {
      const account = await createSingleAccount(
        seedPhrase,
        i,
        changedNetwork.type,
        changedStacksNetwork,
        savedNames[changedNetwork.type],
      );
      nextAccounts.push(account);
    }

    await loadActiveAccounts(seedPhrase, changedNetwork, changedStacksNetwork, nextAccounts, {
      resetIndex: true,
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

  const renameSoftwareAccount = async (updatedAccount: Account) => {
    if (updatedAccount.accountType !== 'software') {
      throw new Error('Expected software account. Renaming cancelled.');
    }
    const newAccountsList = softwareAccountsList.map((account) =>
      account.id === updatedAccount.id ? updatedAccount : account,
    );

    dispatch(updateSoftwareAccountsAction(newAccountsList));

    const updatedSavedNames =
      savedNames[network.type]?.map((item) =>
        item.id === updatedAccount.id ? { ...item, name: updatedAccount.accountName } : item,
      ) || [];

    if (!updatedSavedNames.find((item) => item.id === updatedAccount.id)) {
      updatedSavedNames.push({ id: updatedAccount.id, name: updatedAccount.accountName });
    }

    dispatch(updateSavedNamesAction(network.type, updatedSavedNames));
  };

  const enableNestedSegWitAddress = () => {
    dispatch(EnableNestedSegWitAddress());
  };

  const changeBtcPaymentAddressType = async (btcPaymentAddressType: 'native' | 'nested') => {
    dispatch(ChangeBtcPaymentAddressType(btcPaymentAddressType));

    if (currentlySelectedAccount) {
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
        { type: 'accountChange' },
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
    createAccount,
    addLedgerAccount,
    removeLedgerAccount,
    updateLedgerAccounts,
    renameSoftwareAccount,
    toggleStxVisibility,
    changeShowDataCollectionAlert,
    enableNestedSegWitAddress,
    changeBtcPaymentAddressType,
  };
};

export default useWalletReducer;
