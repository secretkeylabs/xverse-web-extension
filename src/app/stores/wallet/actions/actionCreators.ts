import { NetworkType } from '@secretkeylabs/xverse-core/types';
import * as actions from './types';
import { Account } from './types';

export function setWalletAction(wallet: actions.WalletData): actions.SetWallet {
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

export function fetchAccountAction(
  selectedAccount: Account,
  accountsList: Account[]
): actions.FetchAccount {
  return {
    type: actions.FetchAccountKey,
    selectedAccount,
    accountsList,
  };
}

export function addAccountRequestAction(
  seed: string,
  network:NetworkType
): actions.AddAccountRequestAction {
  return {
    type: actions.AddAccountRequestKey,
    seed,
    network,
  };
}

export function addAccoutSuccessAction(accountsList: Account[]): actions.AddAccountSuccessAction {
  return {
    type: actions.AddAccountSuccessKey,
    accountsList,
  };
}

export function addAccountFailureAction(error: string): actions.AddAccountFailureAction {
  return {
    type: actions.AddAccountFailureKey,
    error,
  };
}

export function selectAccount(
  selectedAccount: Account,
  stxAddress: string,
  btcAddress: string,
  masterPubKey: string,
  stxPublicKey: string,
  btcPublicKey: string,
  network: NetworkType,
 // stackingState: StackingStateData,
  bnsName?: string,
): actions.SelectAccount {
  return {
    type: actions.SelectAccountKey,
    selectedAccount,
    stxAddress,
    btcAddress,
    masterPubKey,
    stxPublicKey,
    btcPublicKey,
    network,
   // stackingState,
    bnsName,
  };
}
