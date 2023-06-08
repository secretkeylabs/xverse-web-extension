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
import { InternalMethods } from '@common/types/message-types';
import { sendMessage } from '@common/types/messages';
import { useSelector, useDispatch } from 'react-redux';
import useNetworkSelector from '@hooks/useNetwork';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useCurrentSession from './useCurrentSession';

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
  const { setSessionStartTime, clearSessionTime } = useCurrentSession();

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
    const decrypted = await decryptSeedPhrase(encryptedSeed, password);
    try {
      await loadActiveAccounts(decrypted, network, selectedNetwork, accountsList);
    } catch (err) {
      dispatch(
        fetchAccountAction(
          accountsList[0],
          accountsList,
        ),
      );
      dispatch(getActiveAccountsAction(accountsList));
    } finally {
      setSessionStartTime();
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
    clearSessionTime();
    sendMessage({
      method: InternalMethods.RemoveInMemoryKeys,
      payload: undefined,
    });
  };

  const resetWallet = () => {
    dispatch(resetWalletAction());
    chrome.storage.local.clear();
    localStorage.clear();
    clearSessionTime();
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
    try {
      await loadActiveAccounts(wallet.seedPhrase, network, selectedNetwork, [{ bnsName, ...account }]);
    } catch (err) {
      dispatch(fetchAccountAction({ ...account, bnsName }, [{ ...account }]));
      dispatch(getActiveAccountsAction([{ ...account, bnsName }]));
    } finally {
      setSessionStartTime();
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
    setSessionStartTime();
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
