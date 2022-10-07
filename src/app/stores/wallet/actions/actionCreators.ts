import { Account } from '@core/types/accounts';
import { Network } from '@core/types/networks';
import * as actions from './types';

export function setWalletAction(wallet: actions.WalletData): actions.SetWallet {
  return {
    type: actions.SetWalletKey,
    wallet,
  };
}

export function ResetWalletAction(): actions.ResetWallet {
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
  network: Network
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
  network: Network,
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
