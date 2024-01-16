import { filterLedgerAccounts, getDeviceAccountIndex } from '@common/utils/ledger';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useNetworkSelector from '@hooks/useNetwork';
import {
  Account,
  AnalyticsEvents,
  SettingsNetwork,
  StacksMainnet,
  StacksNetwork,
  StacksTestnet,
  createWalletAccount,
  decryptSeedPhraseCBC,
  getBnsName,
  newWallet,
  restoreWalletWithAccounts,
  walletFromSeedPhrase,
} from '@secretkeylabs/xverse-core';
import {
  ChangeNetworkAction,
  addAccountAction,
  fetchAccountAction,
  getActiveAccountsAction,
  renameAccountAction,
  resetWalletAction,
  selectAccount,
  setWalletAction,
  setWalletUnlockedAction,
  storeEncryptedSeedAction,
  updateLedgerAccountsAction,
} from '@stores/wallet/actions/actionCreators';
import { useQueryClient } from '@tanstack/react-query';
import { generatePasswordHash } from '@utils/encryptionUtils';
import { isHardwareAccount, isLedgerAccount } from '@utils/helper';
import { resetMixPanel, trackMixPanel } from '@utils/mixpanel';
import { useDispatch } from 'react-redux';
import useSeedVault from './useSeedVault';
import useWalletSelector from './useWalletSelector';
import useWalletSession from './useWalletSession';

const useWalletReducer = () => {
  const {
    accountsList,
    selectedAccount,
    network,
    ledgerAccountsList,
    encryptedSeed,
    masterPubKey,
  } = useWalletSelector();
  const seedVault = useSeedVault();
  const selectedNetwork = useNetworkSelector();
  const dispatch = useDispatch();
  const { refetch: refetchStxData } = useStxWalletData();
  const { refetch: refetchBtcData } = useBtcWalletData();
  const { setSessionStartTime, clearSessionTime, setSessionStartTimeAndMigrate } =
    useWalletSession();
  const queryClient = useQueryClient();

  const loadActiveAccounts = async (
    secretKey: string,
    currentNetwork: SettingsNetwork,
    currentNetworkObject: StacksNetwork,
    currentAccounts: Account[],
  ) => {
    const walletAccounts = await restoreWalletWithAccounts(
      secretKey,
      currentNetwork,
      currentNetworkObject,
      currentAccounts,
    );

    // we sanitise the account to remove any unknown properties which we had in pervious versions of the app
    walletAccounts[0] = {
      id: walletAccounts[0].id,
      btcAddress: walletAccounts[0].btcAddress,
      btcPublicKey: walletAccounts[0].btcPublicKey,
      masterPubKey: walletAccounts[0].masterPubKey,
      ordinalsAddress: walletAccounts[0].ordinalsAddress,
      ordinalsPublicKey: walletAccounts[0].ordinalsPublicKey,
      stxAddress: walletAccounts[0].stxAddress,
      stxPublicKey: walletAccounts[0].stxPublicKey,
      bnsName: walletAccounts[0].bnsName,
    };

    let selectedAccountData: Account | undefined;
    if (!selectedAccount) {
      [selectedAccountData] = walletAccounts;
    } else if (isLedgerAccount(selectedAccount)) {
      const networkLedgerAccounts = filterLedgerAccounts(ledgerAccountsList, currentNetwork.type);
      const selectedAccountDataInNetwork = networkLedgerAccounts.find(
        (a) => a.id === selectedAccount.id,
      );

      // we try find the specific matching ledger account
      // If we can't find it, we default to the first ledger account in the selected network
      // If we can't find that, we default to the first software account in the wallet
      selectedAccountData =
        selectedAccountDataInNetwork ?? networkLedgerAccounts[0] ?? walletAccounts[0];
    } else {
      selectedAccountData = walletAccounts.find((a) => a.id === selectedAccount.id);
    }

    if (!selectedAccountData) {
      // this should not happen but is a good fallback to have, just in case
      [selectedAccountData] = walletAccounts;
    }

    if (!isHardwareAccount(selectedAccountData)) {
      dispatch(
        setWalletAction({
          ...selectedAccountData,
          seedPhrase: secretKey,
        }),
      );
    }

    dispatch(fetchAccountAction(selectedAccountData, walletAccounts));

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

    dispatch(getActiveAccountsAction(walletAccounts));
  };

  const migrateLegacySeedStorage = async (password: string) => {
    const pHash = await generatePasswordHash(password);
    await decryptSeedPhraseCBC(encryptedSeed, pHash.hash).then(async (decrypted) => {
      await seedVault.init(password);
      await seedVault.storeSeed(decrypted);
      localStorage.removeItem('salt');
      dispatch(storeEncryptedSeedAction(''));
    });
  };

  const unlockWallet = async (password: string) => {
    if (encryptedSeed && encryptedSeed.length > 0) {
      await migrateLegacySeedStorage(password);
      return;
    }
    await seedVault.unlockVault(password);
    try {
      const decrypted = await seedVault.getSeed();
      await loadActiveAccounts(decrypted, network, selectedNetwork, accountsList);
    } catch (err) {
      dispatch(fetchAccountAction(accountsList[0], accountsList));
      dispatch(getActiveAccountsAction(accountsList));
    } finally {
      setSessionStartTimeAndMigrate();
    }
  };

  const lockWallet = async () => {
    await seedVault.lockVault();
    dispatch(setWalletUnlockedAction(false));
  };

  const resetWallet = async () => {
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

  const restoreWallet = async (seed: string, password: string) => {
    const wallet = await walletFromSeedPhrase({
      mnemonic: seed,
      index: 0n,
      network: 'Mainnet',
    });
    const account: Account = {
      id: 0,
      btcAddress: wallet.btcAddress,
      btcPublicKey: wallet.btcPublicKey,
      masterPubKey: wallet.masterPubKey,
      ordinalsAddress: wallet.ordinalsAddress,
      ordinalsPublicKey: wallet.ordinalsPublicKey,
      stxAddress: wallet.stxAddress,
      stxPublicKey: wallet.stxPublicKey,
    };
    const hasSeed = await seedVault.hasSeed();
    if (hasSeed && !masterPubKey) {
      await seedVault.clearVaultStorage();
    }
    await seedVault.init(password);
    await seedVault.storeSeed(seed);
    trackMixPanel(AnalyticsEvents.RestoreWallet);
    const bnsName = await getBnsName(wallet.stxAddress, selectedNetwork);
    dispatch(setWalletAction(wallet));
    localStorage.setItem('migrated', 'true');
    try {
      await loadActiveAccounts(seed, network, selectedNetwork, [
        {
          bnsName,
          ...account,
        },
      ]);
    } catch (err) {
      dispatch(
        fetchAccountAction(
          {
            ...account,
            bnsName,
          },
          [
            {
              ...account,
            },
          ],
        ),
      );
      dispatch(
        getActiveAccountsAction([
          {
            ...account,
            bnsName,
          },
        ]),
      );
    } finally {
      setSessionStartTime();
    }
  };

  const createWallet = async (mnemonic?: string) => {
    const wallet = mnemonic
      ? await walletFromSeedPhrase({ mnemonic, index: 0n, network: 'Mainnet' })
      : await newWallet();

    const account: Account = {
      id: 0,
      btcAddress: wallet.btcAddress,
      btcPublicKey: wallet.btcPublicKey,
      masterPubKey: wallet.masterPubKey,
      ordinalsAddress: wallet.ordinalsAddress,
      ordinalsPublicKey: wallet.ordinalsPublicKey,
      stxAddress: wallet.stxAddress,
      stxPublicKey: wallet.stxPublicKey,
    };
    trackMixPanel(AnalyticsEvents.CreateNewWallet);

    dispatch(setWalletAction(wallet));
    dispatch(fetchAccountAction(account, [account]));
    setSessionStartTime();
    localStorage.setItem('migrated', 'true');
  };

  const createAccount = async () => {
    const seedPhrase = await seedVault.getSeed();
    const newAccountsList = await createWalletAccount(
      seedPhrase,
      network,
      selectedNetwork,
      accountsList,
    );
    dispatch(addAccountAction(newAccountsList));
  };

  const switchAccount = async (account: Account) => {
    // we clear the query cache to prevent data from the other account potentially being displayed
    await queryClient.cancelQueries();
    queryClient.clear();

    dispatch(
      selectAccount(
        account,
        account.stxAddress,
        account.btcAddress,
        account.ordinalsAddress,
        account.masterPubKey,
        account.stxPublicKey,
        account.btcPublicKey,
        account.ordinalsPublicKey,
        network,
        undefined,
        account.accountType,
        account.accountName,
      ),
    );
    dispatch(fetchAccountAction(account, accountsList));
  };

  const changeNetwork = async (changedNetwork: SettingsNetwork) => {
    const seedPhrase = await seedVault.getSeed();
    dispatch(ChangeNetworkAction(changedNetwork));
    const wallet = await walletFromSeedPhrase({
      mnemonic: seedPhrase,
      index: 0n,
      network: changedNetwork.type,
    });
    const account: Account = {
      id: 0,
      btcAddress: wallet.btcAddress,
      btcPublicKey: wallet.btcPublicKey,
      masterPubKey: wallet.masterPubKey,
      ordinalsAddress: wallet.ordinalsAddress,
      ordinalsPublicKey: wallet.ordinalsPublicKey,
      stxAddress: wallet.stxAddress,
      stxPublicKey: wallet.stxPublicKey,
    };
    dispatch(setWalletAction(wallet));
    const networkObject =
      changedNetwork.type === 'Mainnet'
        ? new StacksMainnet({ url: changedNetwork.address })
        : new StacksTestnet({ url: changedNetwork.address });
    try {
      await loadActiveAccounts(wallet.seedPhrase, changedNetwork, networkObject, [account]);
    } catch (err) {
      const bnsName = await getBnsName(wallet.stxAddress, networkObject);
      dispatch(
        fetchAccountAction(
          {
            ...account,
            bnsName,
          },
          [account],
        ),
      );
      dispatch(
        getActiveAccountsAction([
          {
            ...account,
            bnsName,
          },
        ]),
      );
    }
    await refetchStxData();
    await refetchBtcData();
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
    const newLedgerAccountsList = ledgerAccountsList.map((account) =>
      account.id === updatedLedgerAccount.id ? updatedLedgerAccount : account,
    );
    dispatch(updateLedgerAccountsAction(newLedgerAccountsList));
    if (isLedgerAccount(selectedAccount) && updatedLedgerAccount.id === selectedAccount?.id) {
      switchAccount(updatedLedgerAccount);
    }
  };

  const renameAccount = async (updatedAccount: Account) => {
    const newAccountsList = accountsList.map((account) =>
      account.accountType === updatedAccount.accountType && account.id === updatedAccount.id
        ? updatedAccount
        : account,
    );
    const newSelectedAccount =
      selectedAccount?.accountType === updatedAccount.accountType &&
      selectedAccount?.id === updatedAccount.id
        ? { ...selectedAccount, accountName: updatedAccount.accountName }
        : selectedAccount;

    dispatch(renameAccountAction(newAccountsList, newSelectedAccount));
  };

  return {
    unlockWallet,
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
    renameAccount,
  };
};

export default useWalletReducer;
