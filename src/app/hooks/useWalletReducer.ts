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
import { useSelector, useDispatch } from 'react-redux';
import useNetworkSelector from '@hooks/useNetwork';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';

const useWalletReducer = () => {
  const {
    encryptedSeed,
    accountsList,
    seedPhrase,
    selectedAccount,
    network,
    ledgerAccountsList,
    isLedgerAccount,
  } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));
  const selectedNetwork = useNetworkSelector();
  const dispatch = useDispatch();
  const { refetch: refetchStxData } = useStxWalletData();
  const { refetch: refetchBtcData } = useBtcWalletData();

  const loadActiveAccounts = async (
    secretKey: string,
    currentNetwork: SettingsNetwork,
    currentNetworkObject: StacksNetwork,
    currentAccounts: Account[]
  ) => {
    const walletAccounts = await restoreWalletWithAccounts(
      secretKey,
      currentNetwork,
      currentNetworkObject,
      currentAccounts
    );

    if (!isLedgerAccount) {
      dispatch(
        setWalletAction(
          selectedAccount
            ? { ...walletAccounts[selectedAccount.id], seedPhrase: secretKey }
            : { ...walletAccounts[0], seedPhrase: secretKey }
        )
      );
    }

    dispatch(
      fetchAccountAction(
        selectedAccount
          ? isLedgerAccount
            ? ledgerAccountsList[selectedAccount.id]
            : walletAccounts[selectedAccount.id]
          : walletAccounts[0],
        walletAccounts
      )
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
    try {
      await loadActiveAccounts(wallet.seedPhrase, network, selectedNetwork, [
        { id: 0, bnsName, ...wallet },
      ]);
    } catch (err) {
      dispatch(fetchAccountAction({ ...wallet, id: 0, bnsName }, [{ ...wallet, id: 0 }]));
      dispatch(getActiveAccountsAction([{ ...wallet, id: 0, bnsName }]));
    }
  };

  const createWallet = async () => {
    const wallet = await newWallet();
    const account: Account = {
      ...wallet,
      id: 0,
    };
    dispatch(setWalletAction(wallet));
    dispatch(fetchAccountAction(account, [account]));
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
        accountsList
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
        account.isLedgerAccount,
        account.accountName
      )
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
    dispatch(setWalletAction(wallet));
    try {
      await loadActiveAccounts(wallet.seedPhrase, changedNetwork, networkObject, [
        { ...wallet, id: 0 },
      ]);
    } catch (err) {
      const bnsName = await getBnsName(wallet.stxAddress, networkObject);
      dispatch(fetchAccountAction({ ...wallet, id: 0, bnsName }, [{ ...wallet, id: 0 }]));
      dispatch(getActiveAccountsAction([{ ...wallet, id: 0, bnsName }]));
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
    const newLedgerAccountsList = ledgerAccountsList.map((account) =>
      account.id === updatedLedgerAccount.id ? updatedLedgerAccount : account
    );
    try {
      dispatch(addLedgerAcountAction(newLedgerAccountsList));
      if (isLedgerAccount && updatedLedgerAccount.id === selectedAccount?.id) {
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
