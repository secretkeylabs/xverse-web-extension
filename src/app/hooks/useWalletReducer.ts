import { SettingsNetwork, Account } from '@secretkeylabs/xverse-core/types';
import { newWallet, walletFromSeedPhrase } from '@secretkeylabs/xverse-core/wallet';
import { createWalletAccount, restoreWalletWithAccounts } from '@secretkeylabs/xverse-core/account';
import { getBnsName } from '@secretkeylabs/xverse-core/api/stacks';
import { StoreState } from '@stores/index';
import {
  addAccoutAction,
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
    encryptedSeed, network, accountsList, seedPhrase, configPrivateKey,
  } = useSelector(
    (state: StoreState) => ({
      ...state.walletState,
    }),
  );
  const dispatch = useDispatch();

  const loadActiveAccounts = async (secretKey: string, currentNetwork: SettingsNetwork, firstAccount: Account) => {
    const walletAccounts = await restoreWalletWithAccounts(secretKey, currentNetwork, [{ ...firstAccount }]);
    dispatch(fetchAccountAction(walletAccounts[0], walletAccounts));
    dispatch(getActiveAccountsAction(walletAccounts));
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
    const bnsName = await getBnsName(wallet.stxAddress, network);
    dispatch(storeEncryptedSeedAction(encryptSeed));
    dispatch(setWalletAction(wallet));
    await loadActiveAccounts(wallet.seedPhrase, network, { id: 0, bnsName, ...wallet });
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

  const createAccount = async () => {
    try {
      const newAccountsList = await createWalletAccount(
        seedPhrase,
        network,
        accountsList,
        configPrivateKey,
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

  const unlockWallet = async (password: string) => {
    try {
      const decrypted = await decryptSeedPhrase(encryptedSeed, password);
      await restoreWallet(decrypted, password);
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

  return {
    unlockWallet,
    lockWallet,
    resetWallet,
    restoreWallet,
    createWallet,
    switchAccount,
    changeNetwork,
    createAccount,
  };
};

export default useWalletReducer;
