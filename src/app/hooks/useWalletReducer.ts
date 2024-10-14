import { getDeviceAccountIndex } from '@common/utils/ledger';
import { dispatchEventAuthorizedConnectedClients } from '@common/utils/messages/extensionToContentScript/dispatchEvent';
import { makeAccountResourceId } from '@components/permissionsManager/resources';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  AnalyticsEvents,
  StacksMainnet,
  StacksNetwork,
  StacksTestnet,
  createWalletAccount,
  decryptSeedPhraseCBC,
  getBnsName,
  restoreWalletWithAccounts,
  walletFromSeedPhrase,
  type Account,
  type NetworkType,
  type SettingsNetwork,
} from '@secretkeylabs/xverse-core';
import {
  ChangeNetworkAction,
  changeShowDataCollectionAlertAction,
  resetWalletAction,
  selectAccount,
  setWalletHideStxAction,
  setWalletUnlockedAction,
  storeEncryptedSeedAction,
  updateKeystoneAccountsAction,
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
import useSeedVault from './useSeedVault';
import useWalletSession from './useWalletSession';

// TODO: move this to core as the primary way to create an account
const createSingleAccount = async (
  seedPhrase: string,
  accountIndex: number,
  btcNetwork: NetworkType,
  stacksNetwork: StacksNetwork,
  savedNames: { id: number; name?: string }[] = [],
) => {
  const {
    stxAddress,
    btcAddress,
    ordinalsAddress,
    masterPubKey,
    stxPublicKey,
    btcPublicKey,
    ordinalsPublicKey,
  } = await walletFromSeedPhrase({
    mnemonic: seedPhrase,
    index: BigInt(accountIndex),
    network: btcNetwork,
  });
  const bnsName = await getBnsName(stxAddress, stacksNetwork);
  const customName = savedNames.find((name) => name.id === accountIndex)?.name;
  const account: Account = {
    id: accountIndex,
    stxAddress,
    btcAddress,
    ordinalsAddress,
    masterPubKey,
    stxPublicKey,
    btcPublicKey,
    ordinalsPublicKey,
    bnsName,
    accountName: customName,
    accountType: 'software',
  };

  return account;
};

const useWalletReducer = () => {
  const {
    network,
    encryptedSeed,
    selectedAccountIndex,
    selectedAccountType,
    accountsList: accounts,
    savedNames,
    ledgerAccountsList,
    keystoneAccountsList,
    showDataCollectionAlert,
    hideStx,
  } = useWalletSelector();
  const seedVault = useSeedVault();
  const selectedNetwork = useNetworkSelector();

  const dispatch = useDispatch();
  const { setSessionStartTime, clearSessionTime, setSessionStartTimeAndMigrate } =
    useWalletSession();
  const queryClient = useQueryClient();

  const ensureSelectedAccountValid = useCallback(
    async (
      selectedType = selectedAccountType,
      selectedIndex = selectedAccountIndex,
    ): Promise<void> => {
      if (['ledger', 'keystone'].includes(selectedType)) {
        // these accounts are created by ledger or keystone, so we cannot regenerate them
        return;
      }

      const seedPhrase = await seedVault.getSeed();
      const recreatedAccount = await createSingleAccount(
        seedPhrase,
        selectedIndex,
        network.type,
        selectedNetwork,
        savedNames[network.type],
      );

      const selectedAccount = accounts.find((account) => account.id === selectedIndex);

      if (!selectedAccount) {
        // if the selected account index does not exist, we cannot update it
        // in this case, the account selection will be reset to the first account elsewhere
        return;
      }

      const accountsMatch = Object.keys(recreatedAccount).every(
        (key) => selectedAccount[key] === recreatedAccount[key],
      );

      if (!accountsMatch) {
        const newAccountsList = accounts.map((account) =>
          account.id === selectedIndex ? recreatedAccount : account,
        );

        dispatch(updateSoftwareAccountsAction(newAccountsList));
      }
    },
    [
      dispatch,
      network.type,
      seedVault,
      selectedAccountIndex,
      selectedAccountType,
      selectedNetwork,
      accounts,
      savedNames,
    ],
  );

  const loadActiveAccounts = async (
    secretKey: string,
    currentNetwork: SettingsNetwork,
    currentNetworkObject: StacksNetwork,
    currentAccounts: Account[],
    resetIndex?: boolean,
  ) => {
    const walletAccounts = await restoreWalletWithAccounts(
      secretKey,
      currentNetwork,
      currentNetworkObject,
      currentAccounts,
    );

    // Load custom account names for the new network
    const savedCustomAccountNames = savedNames[currentNetwork.type];
    if (savedCustomAccountNames?.length) {
      walletAccounts.forEach((account) => {
        const savedAccount = savedCustomAccountNames.find((acc) => acc.id === account.id);
        if (savedAccount) {
          account.accountName = savedAccount.name;
        }
      });
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

    dispatch(updateSoftwareAccountsAction(walletAccounts));

    if (resetIndex) {
      dispatch(selectAccount(walletAccounts[0]));
    }

    return walletAccounts;
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
    const updatedSavedNames = accounts.reduce<{ id: number; name: string }[]>((acc, account) => {
      if (account.accountName) {
        acc.push({ id: account.id, name: account.accountName });
      }
      return acc;
    }, []);
    dispatch(updateSavedNamesAction(network.type, updatedSavedNames));
  };

  const loadWallet = async () => {
    const seedPhrase = await seedVault.getSeed();
    const currentAccounts = accounts || [];

    if (currentAccounts.length === 0) {
      // This will happen on first load after the wallet is created. We create the accounts here to ensure
      // the wallet seed phrase is finalised and in the vault before we create the accounts.
      // We create one account to ensure the wallet is functional on load, if there were others, they will
      // get populated in the loadActiveAccounts method.
      const account = await createSingleAccount(
        seedPhrase,
        0,
        network.type,
        selectedNetwork,
        savedNames[network.type],
      );
      currentAccounts.push(account);

      await loadActiveAccounts(seedPhrase, network, selectedNetwork, currentAccounts);
    }

    await ensureSelectedAccountValid();

    if (!savedNames[network.type]?.length && accounts.some((account) => !!account.accountName)) {
      // there was no savedNames store object initially
      // this is a migration to add the savedNames if there are custom account names that are not saved
      // it should only fire once if ever
      loadAccountNames();
    }

    dispatch(setWalletUnlockedAction(true));
    setSessionStartTimeAndMigrate();
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
    await createSingleAccount(
      seedPhrase,
      0,
      network.type,
      selectedNetwork,
      savedNames[network.type],
    );

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
        const wallet = await walletFromSeedPhrase({
          mnemonic: seed,
          index: 0n,
          network: 'Mainnet',
        });
        optInMixPanel(wallet.masterPubKey);
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
    const newAccounts = await createWalletAccount(seedPhrase, network, selectedNetwork, accounts);
    dispatch(updateSoftwareAccountsAction(newAccounts));
  };

  const switchAccount = useCallback(
    async (nextAccount: Account) => {
      // we clear the query cache to prevent data from the other account potentially being displayed
      await queryClient.cancelQueries();
      queryClient.clear();

      await ensureSelectedAccountValid(nextAccount.accountType, nextAccount.id);

      console.warn('DEBUGPRINT[1]: useWalletReducer.ts:363: nextAccount=', nextAccount);
      dispatch(selectAccount(nextAccount));

      dispatchEventAuthorizedConnectedClients(
        {
          resourceId: makeAccountResourceId({
            accountId: accounts[selectedAccountIndex].id,
            masterPubKey: accounts[selectedAccountIndex].masterPubKey,
            networkType: network.type,
          }),
          actions: new Set(['read']),
        },
        { type: 'accountChange' },
      );
    },
    [
      accounts,
      dispatch,
      ensureSelectedAccountValid,
      network.type,
      queryClient,
      selectedAccountIndex,
    ],
  );

  const changeNetwork = async (changedNetwork: SettingsNetwork) => {
    // Save current custom account names
    const currentNetworkType = network.type;
    const customAccountNames = accounts.map((account) => ({
      id: account.id,
      name: account.accountName,
    }));
    dispatch(updateSavedNamesAction(currentNetworkType, customAccountNames));

    // we clear the query cache to prevent data from the other account potentially being displayed
    await queryClient.cancelQueries();
    queryClient.clear();

    dispatch(ChangeNetworkAction(changedNetwork));

    dispatchEventAuthorizedConnectedClients(
      {
        resourceId: makeAccountResourceId({
          accountId: accounts[selectedAccountIndex].id,
          masterPubKey: accounts[selectedAccountIndex].masterPubKey,
          networkType: network.type,
        }),
        actions: new Set(['read']),
      },
      { type: 'networkChange' },
    );

    const seedPhrase = await seedVault.getSeed();
    const changedStacksNetwork =
      changedNetwork.type === 'Mainnet'
        ? new StacksMainnet({ url: changedNetwork.address })
        : new StacksTestnet({ url: changedNetwork.address });

    const nextAccounts: Account[] = [];

    // we recreate the same number of accounts on the new network
    for (let i = 0; i < accounts.length; i++) {
      const account = await createSingleAccount(
        seedPhrase,
        i,
        changedNetwork.type,
        changedStacksNetwork,
        savedNames[changedNetwork.type],
      );
      nextAccounts.push(account);
    }

    await loadActiveAccounts(seedPhrase, changedNetwork, changedStacksNetwork, nextAccounts, true);
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
    console.warn('DEBUGPRINT[4]: useWalletReducer.ts:463: keystoneAccount=', keystoneAccount);
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

  // TODO: refactor this to be more specific to renaming software accounts
  const renameAccount = async (updatedAccount: Account) => {
    if (updatedAccount.accountType !== 'software') {
      throw new Error('Expected software account. Renaming cancelled.');
    }
    const newAccountsList = accounts.map((account) =>
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
    addKeystoneAccount,
    removeKeystoneAccount,
    updateKeystoneAccounts,
    renameAccount,
    toggleStxVisibility,
    changeShowDataCollectionAlert,
  };
};

export default useWalletReducer;
