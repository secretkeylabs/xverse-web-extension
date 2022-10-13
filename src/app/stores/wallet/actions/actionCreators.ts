import { NetworkType, SettingsNetwork, StxTransactionData } from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';
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
  network:NetworkType,
  accountsList: Account[]
): actions.AddAccountRequest{
  return {
    type: actions.AddAccountRequestKey,
    seed,
    network,
    accountsList
  };
}

export function addAccoutSuccessAction(accountsList: Account[]): actions.AddAccountSuccess{
  return {
    type: actions.AddAccountSuccessKey,
    accountsList,
  };
}

export function addAccountFailureAction(error: string): actions.AddAccountFailure {
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

export function fetchWalletDataAction(
  stxAddress: string,
  btcAddress: string,
  network: NetworkType,
  fiatCurrency: string
): actions.FetchWalletDataRequest {
  return {
    type: actions.FetchWalletDataRequestKey,
    stxAddress,
    btcAddress,
    network,
    fiatCurrency
  };
}

export function fetchWalletDataSuccessAction(
  totalBalance: BigNumber,
  stxBalance: BigNumber,
  stxAvailableBalance: BigNumber,
  stxLockedBalance: BigNumber,
  btcBalance: BigNumber,
  stxTransactions: StxTransactionData[],
  stxNonce: number,
  totalTransactions: number,
  selectedNetwork: SettingsNetwork,
): actions.FetchWalletDataSuccess {
  return {
    type: actions.FetchWalletDataSuccessKey,
    totalBalance,
    stxBalance,
    stxAvailableBalance,
    stxLockedBalance,
    btcBalance,
    stxTransactions,
    stxNonce,
    totalTransactions,
    selectedNetwork,
  };
}

export function fetchWalletDataFailureAction() {
  return {
    type: actions.FetchWalletDataFailureKey,
  };
}
