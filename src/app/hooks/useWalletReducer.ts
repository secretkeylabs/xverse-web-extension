import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useNetworkSelector from '@hooks/useNetwork';
import { createWalletAccount, restoreWalletWithAccounts } from '@secretkeylabs/xverse-core/account';
import { getBnsName } from '@secretkeylabs/xverse-core/api/stacks';
import { Account, SettingsNetwork, StacksNetwork } from '@secretkeylabs/xverse-core/types';
import { newWallet, walletFromSeedPhrase } from '@secretkeylabs/xverse-core/wallet';
import { decryptSeedPhraseCBC } from '@secretkeylabs/xverse-core/encryption';
import {
  ChangeNetworkAction,
  addAccountAction,
  fetchAccountAction,
  getActiveAccountsAction,
  resetWalletAction,
  selectAccount,
  setWalletAction,
  setWalletUnlockedAction,
  storeEncryptedSeedAction,
  updateLedgerAccountsAction,
} from '@stores/wallet/actions/actionCreators';
import { useDispatch } from 'react-redux';
import { isHardwareAccount, isLedgerAccount } from '@utils/helper';
import { getDeviceAccountIndex } from '@common/utils/ledger';
import { generatePasswordHash } from '@utils/encryptionUtils';
import { PostGuardPing } from '@components/guards/singleTab';
import useWalletSession from './useWalletSession';
import useSeedVault from './useSeedVault';
import useWalletSelector from './useWalletSelector';

const useWalletReducer = () => {
  const { accountsList, selectedAccount, network, ledgerAccountsList, encryptedSeed } =
    useWalletSelector();
  const seedVault = useSeedVault();
  const selectedNetwork = useNetworkSelector();
  const dispatch = useDispatch();
  const { refetch: refetchStxData } = useStxWalletData();
  const { refetch: refetchBtcData } = useBtcWalletData();
  const { setSessionStartTime, clearSessionTime } = useWalletSession();

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

    if (!isHardwareAccount(selectedAccount)) {
      dispatch(
        setWalletAction(
          selectedAccount
            ? {
                ...walletAccounts[selectedAccount.id],
                seedPhrase: secretKey,
              }
            : {
                ...walletAccounts[0],
                seedPhrase: secretKey,
              },
        ),
      );
    }

    dispatch(
      fetchAccountAction(
        // eslint-disable-next-line no-nested-ternary
        selectedAccount
          ? isLedgerAccount(selectedAccount)
            ? ledgerAccountsList[selectedAccount.id]
            : walletAccounts[selectedAccount.id]
          : walletAccounts[0],
        walletAccounts,
      ),
    );

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
      setSessionStartTime();
    }
  };

  const lockWallet = async () => {
    await seedVault.lockVault();
    dispatch(setWalletUnlockedAction(false));
    PostGuardPing('closeWallet');
  };

  const resetWallet = async () => {
    dispatch(resetWalletAction());
    localStorage.clear();
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
      bnsName: wallet.bnsName,
    };
    await seedVault.init(password);
    await seedVault.storeSeed(seed);
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
      bnsName: wallet.bnsName,
    };
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

  const switchAccount = (account: Account) => {
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

  const changeNetwork = async (
    changedNetwork: SettingsNetwork,
    networkObject: StacksNetwork,
    networkAddress: string,
    btcApiUrl: string,
  ) => {
    const seedPhrase = await seedVault.getSeed();
    dispatch(ChangeNetworkAction(changedNetwork, networkAddress, btcApiUrl));
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
      bnsName: wallet.bnsName,
    };
    dispatch(setWalletAction(wallet));
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
    try {
      dispatch(updateLedgerAccountsAction([...ledgerAccountsList, ledgerAccount]));
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const removeLedgerAccount = async (ledgerAccount: Account) => {
    try {
      dispatch(
        updateLedgerAccountsAction(
          ledgerAccountsList.filter((account) => account.id !== ledgerAccount.id),
        ),
      );
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const updateLedgerAccounts = async (updatedLedgerAccount: Account) => {
    const newLedgerAccountsList = ledgerAccountsList.map((account) =>
      account.id === updatedLedgerAccount.id ? updatedLedgerAccount : account,
    );
    try {
      dispatch(updateLedgerAccountsAction(newLedgerAccountsList));
      if (isLedgerAccount(selectedAccount) && updatedLedgerAccount.id === selectedAccount?.id) {
        switchAccount(updatedLedgerAccount);
      }
    } catch (err) {
      return Promise.reject(err);
    }
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
  };
};

export default useWalletReducer;
