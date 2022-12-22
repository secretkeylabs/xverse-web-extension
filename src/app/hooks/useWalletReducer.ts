import { SettingsNetwork } from '@secretkeylabs/xverse-core/types';
import { Account } from '@secretkeylabs/xverse-core';
import { getActiveAccountList } from '@secretkeylabs/xverse-core/account';
import { newWallet, walletFromSeedPhrase } from '@secretkeylabs/xverse-core/wallet';
import { StoreState } from '@stores/index';
import {
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
import { InternalMethods } from 'content-scripts/message-types';
import { sendMessage } from 'content-scripts/messages';
import { useSelector, useDispatch } from 'react-redux';

const useWalletReducer = () => {
  const {
    encryptedSeed,
    network,
    accountsList,
    seedPhrase,
  } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));
  const dispatch = useDispatch();

  const loadActiveAccounts = async (secretKey: string, currentNetwork: SettingsNetwork, firstAccount: Account) => {
    const walletAccounts = await getActiveAccountList(secretKey, currentNetwork, firstAccount);
    dispatch(fetchAccountAction(walletAccounts[0], walletAccounts));
    dispatch(getActiveAccountsAction(walletAccounts));
  };

  const unlockWallet = async (password: string) => {
    try {
      const decrypted = await decryptSeedPhrase(encryptedSeed, password);
      sendMessage({
        method: InternalMethods.ShareInMemoryKeyToBackground,
        payload: {
          secretKey: decrypted,
        },
      });
      dispatch(unlockWalletAction(decrypted));
      return decrypted;
    } catch (err) {
      return Promise.reject(err);
    }
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
    sendMessage({
      method: InternalMethods.ShareInMemoryKeyToBackground,
      payload: {
        secretKey: wallet.seedPhrase,
      },
    });
    dispatch(storeEncryptedSeedAction(encryptSeed));
    dispatch(setWalletAction(wallet));
    await loadActiveAccounts(wallet.seedPhrase, network, { ...wallet, id: 0 });
  };

  const createWallet = async () => {
    const wallet = await newWallet();
    const account: Account = {
      ...wallet,
      id: 0,
    };
    dispatch(setWalletAction(wallet));
    dispatch(fetchAccountAction(account, [account]));
    sendMessage({
      method: InternalMethods.ShareInMemoryKeyToBackground,
      payload: {
        secretKey: wallet.seedPhrase,
      },
    });
  };

  const switchAccount = (account: Account) => {
    dispatch(
      selectAccount(
        account,
        account.stxAddress,
        account.btcAddress,
        account.masterPubKey,
        account.stxPublicKey,
        account.btcPublicKey,
        network,
      ),
    );
    dispatch(fetchAccountAction(account, accountsList));
  };

  const changeNetwork = async (changedNetwork: SettingsNetwork) => {
    dispatch(ChangeNetworkAction(changedNetwork));
    const wallet = await walletFromSeedPhrase({
      mnemonic: seedPhrase,
      index: 0n,
      network: changedNetwork.type,
    });
    dispatch(setWalletAction(wallet));
    await loadActiveAccounts(wallet.seedPhrase, changedNetwork, { ...wallet, id: 0 });
  };

  return {
    unlockWallet,
    lockWallet,
    resetWallet,
    restoreWallet,
    createWallet,
    switchAccount,
    changeNetwork,
  };
};

export default useWalletReducer;
