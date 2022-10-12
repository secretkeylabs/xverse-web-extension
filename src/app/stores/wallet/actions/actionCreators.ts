import * as actions from './types';

export function setWalletAction(
  wallet: actions.WalletData,
): actions.SetWallet {
  return {
    type: actions.SetWalletKey,
    wallet,
  };
}

export function unlockWalletAction(seed : string) {
  return {
    type: actions.UnlockWalletKey,
    seed,
  };
}

export function storeEncryptedSeedAction(encryptedSeed :string): actions.StoreEncryptedSeed {
  return {
    type: actions.StoreEncryptedSeedKey,
    encryptedSeed,
  };
}

export function resetWalletAction(): actions.ResetWallet {
  return {
    type: actions.ResetWalletKey,
  };
}
