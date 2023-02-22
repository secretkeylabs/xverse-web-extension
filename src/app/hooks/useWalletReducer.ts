import {
  Account, SettingsNetwork, StacksNetwork,
} from '@secretkeylabs/xverse-core/types';
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
import useNetworkSelector from '@hooks/useNetwork';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';

const useWalletReducer = () => {
  const {
    encryptedSeed, accountsList, seedPhrase, selectedAccount, network,
  } = useSelector(
    (state: StoreState) => ({
      ...state.walletState,
    }),
  );
  const selectedNetwork = useNetworkSelector();
  const dispatch = useDispatch();
  const { refetch: refetchStxData } = useStxWalletData();
  const { refetch: refetchBtcData } = useBtcWalletData();

  const loadActiveAccounts = async (secretKey: string, currentNetwork: SettingsNetwork, currentNetworkObject: StacksNetwork, currentAccounts: Account[]) => {
    const walletAccounts = await restoreWalletWithAccounts(secretKey, currentNetwork, currentNetworkObject, currentAccounts);
    dispatch(
      setWalletAction(
        selectedAccount
          ? { ...walletAccounts[selectedAccount.id], seedPhrase: secretKey }
          : { ...walletAccounts[0], seedPhrase: secretKey },
      ),
    );
    dispatch(fetchAccountAction(selectedAccount ? walletAccounts[selectedAccount.id] : walletAccounts[0], walletAccounts));
    dispatch(getActiveAccountsAction(walletAccounts));
  };

  const unlockWallet = async (password: string) => {
    try {
      const decrypted = await decryptSeedPhrase(encryptedSeed, password);
      await loadActiveAccounts(decrypted, network, selectedNetwork, accountsList);
      await sendMessage({
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
    await sendMessage({
      method: InternalMethods.ShareInMemoryKeyToBackground,
      payload: {
        secretKey: wallet.seedPhrase,
      },
    });
    const bnsName = await getBnsName(wallet.stxAddress, selectedNetwork);
    dispatch(storeEncryptedSeedAction(encryptSeed));
    dispatch(setWalletAction(wallet));
    await loadActiveAccounts(wallet.seedPhrase, network, selectedNetwork, [{ id: 0, bnsName, ...wallet }]);
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
        network,
      ),
    );
    dispatch(fetchAccountAction(account, accountsList));
  };

  const changeNetwork = async (changedNetwork: SettingsNetwork, networkObject: StacksNetwork, networkAddress: string) => {
    dispatch(ChangeNetworkAction(changedNetwork, networkAddress));
    const wallet = await walletFromSeedPhrase({
      mnemonic: seedPhrase,
      index: 0n,
      network: changedNetwork.type,
    });
    dispatch(setWalletAction(wallet));
    await loadActiveAccounts(wallet.seedPhrase, changedNetwork, networkObject, { ...wallet, id: 0 });
    await refetchStxData();
    await refetchBtcData();
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
