import { walletFromSeedPhrase } from '@secretkeylabs/xverse-core/wallet';
import { StoreState } from '@stores/index';
import {
  resetWalletAction,
  setWalletAction,
  storeEncryptedSeedAction,
  unlockWalletAction,
} from '@stores/wallet/actions/actionCreators';
import { decryptSeedPhrase, encryptSeedPhrase } from '@utils/encryptionUtils';
import { useSelector, useDispatch } from 'react-redux';

const useWalletReducer = () => {
  const { encryptedSeed } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));
  const dispatch = useDispatch();

  const unlockWallet = async (password: string) => {
    try {
      const decrypted = await decryptSeedPhrase(encryptedSeed, password);
      dispatch(unlockWalletAction(decrypted));
      return decrypted;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const resetWallet = () => {
    dispatch(resetWalletAction());
    chrome.storage.local.clear();
  };

  const restoreWallet = async (seed: string, password: string) => {
    const wallet = await walletFromSeedPhrase({
      mnemonic: seed,
      index: 0n,
      network: 'Mainnet',
    });
    const encryptedSeed = await encryptSeedPhrase(seed, password);
    dispatch(storeEncryptedSeedAction(encryptedSeed));
    dispatch(setWalletAction(wallet));
  };

  return {
    unlockWallet,
    resetWallet,
    restoreWallet,
  };
};

export default useWalletReducer;
