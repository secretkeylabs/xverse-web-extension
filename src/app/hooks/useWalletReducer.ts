import { Account, SettingsNetwork, StacksNetwork } from '@secretkeylabs/xverse-core/types';
import { newWallet, walletFromSeedPhrase } from '@secretkeylabs/xverse-core/wallet';
import { createWalletAccount, restoreWalletWithAccounts } from '@secretkeylabs/xverse-core/account';
import { getBnsName } from '@secretkeylabs/xverse-core/api/stacks';
import { StoreState } from '@stores/index';
import {
  addAccoutAction,
  addLedgerAcountAction,
  ChangeNetworkAction,
  fetchAccountAction,
  getActiveAccountsAction,
  lockWalletAction,
  resetWalletAction,
  selectAccount,
  setWalletAction,
  storeEncryptedSeedAction,
  unlockWalletAction,
} from '@stores/wallet/actions/actionCreators';
import { decryptSeedPhrase, encryptSeedPhrase } from '@utils/encryptionUtils';
import { InternalMethods } from '@common/types/message-types';
import { sendMessage } from '@common/types/messages';
import { useDispatch } from 'react-redux';
import useNetworkSelector from '@hooks/useNetwork';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import { isHardwareAccount, isLedgerAccount } from '@utils/helper';
import useWalletSelector from './useWalletSelector';

const useWalletReducer = () => {
  const {
    encryptedSeed, accountsList, seedPhrase, selectedAccount, network, ledgerAccountsList,
  } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const dispatch = useDispatch();
  const { refetch: refetchStxData } = useStxWalletData();
  const { refetch: refetchBtcData } = useBtcWalletData();

  const loadActiveAccounts = async (secretKey: string, currentNetwork: SettingsNetwork, currentNetworkObject: StacksNetwork, currentAccounts: Account[]) => {
    const walletAccounts = await restoreWalletWithAccounts(secretKey, currentNetwork, currentNetworkObject, currentAccounts);

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
            ? { ...walletAccounts[selectedAccount.id], seedPhrase: secretKey }
            : { ...walletAccounts[0], seedPhrase: secretKey },
        ),
      );
    }

    dispatch(
      fetchAccountAction(
        selectedAccount
          ? isLedgerAccount(selectedAccount)
            ? ledgerAccountsList[selectedAccount.id]
            : walletAccounts[selectedAccount.id]
          : walletAccounts[0],
        walletAccounts,
      ),
    );

    dispatch(getActiveAccountsAction(walletAccounts));
  };

  const unlockWallet = async (password: string) => {
    const decrypted = await decryptSeedPhrase(encryptedSeed, password);
    try {
      await loadActiveAccounts(decrypted, network, selectedNetwork, accountsList);
    } catch (err) {
      dispatch(fetchAccountAction(accountsList[0], accountsList));
      dispatch(getActiveAccountsAction(accountsList));
    }
    sendMessage({
      method: InternalMethods.ShareInMemoryKeyToBackground,
      payload: {
        secretKey: decrypted,
      },
    });
    dispatch(unlockWalletAction(decrypted));
    return decrypted;
  };

  const lockWallet = () => {
    dispatch(lockWalletAction());
    sendMessage({
      method: InternalMethods.RemoveInMemoryKeys,
      payload: undefined,
    });
  };

  const resetWallet = () => {
    dispatch(resetWalletAction());
    chrome.storage.local.clear();
    localStorage.clear();
    sendMessage({
      method: InternalMethods.RemoveInMemoryKeys,
      payload: undefined,
    });
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
    const encryptSeed = await encryptSeedPhrase(seed, password);
    await sendMessage({
      method: InternalMethods.ShareInMemoryKeyToBackground,
      payload: {
        secretKey: wallet.seedPhrase,
      },
    });
    const bnsName = await getBnsName(wallet.stxAddress, selectedNetwork);
    dispatch(storeEncryptedSeedAction(encryptSeed));
    dispatch(setWalletAction(wallet));
    localStorage.setItem('migrated', 'true');
    try {
      await loadActiveAccounts(wallet.seedPhrase, network, selectedNetwork, [{ bnsName, ...account }]);
    } catch (err) {
      dispatch(fetchAccountAction({ ...account, bnsName }, [{ ...account }]));
      dispatch(getActiveAccountsAction([{ ...account, bnsName }]));
    }
  };

  const createWallet = async () => {
    const wallet = await newWallet();
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
    localStorage.setItem('migrated', 'true');
    await sendMessage({
      method: InternalMethods.ShareInMemoryKeyToBackground,
      payload: {
        secretKey: wallet.seedPhrase,
      },
    });
  };

  const createAccount = async () => {
    try {
      const newAccountsList = await createWalletAccount(
        seedPhrase,
        network,
        selectedNetwork,
        accountsList,
      );
      dispatch(addAccoutAction(newAccountsList));
    } catch (err) {
      return Promise.reject(err);
    }
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
      dispatch(fetchAccountAction({ ...account, bnsName }, [account]));
      dispatch(getActiveAccountsAction([{ ...account, bnsName }]));
    }
    await refetchStxData();
    await refetchBtcData();
  };

  const addLedgerAccount = async (ledgerAccount: Account) => {
    try {
      dispatch(addLedgerAcountAction([...ledgerAccountsList, ledgerAccount]));
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const updateLedgerAccounts = async (updatedLedgerAccount: Account) => {
    const newLedgerAccountsList = ledgerAccountsList.map((account) => (account.id === updatedLedgerAccount.id ? updatedLedgerAccount : account));
    try {
      dispatch(addLedgerAcountAction(newLedgerAccountsList));
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
    updateLedgerAccounts,
  };
};

export default useWalletReducer;
