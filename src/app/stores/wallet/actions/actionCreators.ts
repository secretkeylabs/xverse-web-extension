import {
  Account,
  BaseWallet,
  Coin,
  FeesMultipliers,
  FungibleToken,
  SettingsNetwork,
  SupportedCurrency,
  TransactionData,
} from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';
import * as actions from './types';

export function setWalletAction(wallet: BaseWallet): actions.SetWallet {
  return {
    type: actions.SetWalletKey,
    wallet,
  };
}

export function unlockWalletAction(seed: string) {
  return {
    type: actions.UnlockWalletKey,
    seed,
  };
}

export function lockWalletAction() {
  return {
    type: actions.LockWalletKey,
  };
}

export function storeEncryptedSeedAction(encryptedSeed: string): actions.StoreEncryptedSeed {
  return {
    type: actions.StoreEncryptedSeedKey,
    encryptedSeed,
  };
}

export function setWalletSeedPhraseAction(seedPhrase: string) : actions.SetWalletSeedPhrase {
  return {
    type: actions.SetWalletSeedPhraseKey,
    seedPhrase,
  };
}

export function resetWalletAction(): actions.ResetWallet {
  return {
    type: actions.ResetWalletKey,
  };
}

export function fetchAccountAction(
  selectedAccount: Account,
  accountsList: Account[],
): actions.FetchAccount {
  return {
    type: actions.FetchAccountKey,
    selectedAccount,
    accountsList,
  };
}

export function addAccoutAction(accountsList: Account[]): actions.AddAccount {
  return {
    type: actions.AddAccountKey,
    accountsList,
  };
}

export function selectAccount(
  selectedAccount: Account,
  stxAddress: string,
  btcAddress: string,
  dlcBtcAddress: string,
  ordinalsAddress: string,
  masterPubKey: string,
  dlcBtcPublicKey: string,
  stxPublicKey: string,
  btcPublicKey: string,
  ordinalsPublicKey: string,
  network: SettingsNetwork,
  // stackingState: StackingStateData,
  bnsName?: string,
): actions.SelectAccount {
  return {
    type: actions.SelectAccountKey,
    selectedAccount,
    stxAddress,
    btcAddress,
    dlcBtcAddress,
    ordinalsAddress,
    masterPubKey,
    dlcBtcPublicKey,
    stxPublicKey,
    btcPublicKey,
    ordinalsPublicKey,
    network,
    // stackingState,
    bnsName,
  };
}

export function setFeeMultiplierAction(feeMultipliers: FeesMultipliers): actions.SetFeeMultiplier {
  return {
    type: actions.SetFeeMultiplierKey,
    feeMultipliers,
  };
}

export function setCoinRatesAction(
  stxBtcRate: BigNumber,
  btcFiatRate: BigNumber,
): actions.SetCoinRates {
  return {
    type: actions.SetCoinRatesKey,
    stxBtcRate,
    btcFiatRate,
  };
}

export function setStxWalletDataAction(
  stxBalance: BigNumber,
  stxAvailableBalance: BigNumber,
  stxLockedBalance: BigNumber,
  stxTransactions: TransactionData[],
  stxNonce: number,
): actions.SetStxWalletData {
  return {
    type: actions.SetStxWalletDataKey,
    stxBalance,
    stxAvailableBalance,
    stxLockedBalance,
    stxTransactions,
    stxNonce,
  };
}

export function SetBtcWalletDataAction(balance: BigNumber): actions.SetBtcWalletData {
  return {
    type: actions.SetBtcWalletDataKey,
    balance,
  };
}

export function setCoinDataAction(
  coinsList: FungibleToken[],
  supportedCoins: Coin[],
): actions.SetCoinData {
  return {
    type: actions.SetCoinDataKey,
    coinsList,
    supportedCoins,
  };
}

export function FetchUpdatedVisibleCoinListAction(
  coinsList: FungibleToken[],
): actions.UpdateVisibleCoinList {
  return {
    type: actions.UpdateVisibleCoinListKey,
    coinsList,
  };
}

export function ChangeFiatCurrencyAction(fiatCurrency: SupportedCurrency): actions.ChangeFiatCurrency {
  return {
    type: actions.ChangeFiatCurrencyKey,
    fiatCurrency,
  };
}

export function ChangeNetworkAction(network: SettingsNetwork, networkAddress: string): actions.ChangeNetwork {
  return {
    type: actions.ChangeNetworkKey,
    network,
    networkAddress,
  };
}

export function getActiveAccountsAction(
  accountsList: Account[],
): actions.GetActiveAccounts {
  return {
    type: actions.GetActiveAccountsKey,
    accountsList,
  };
}

export function ChangeActivateOrdinalsAction(hasActivatedOrdinalsKey: boolean): actions.ChangeActivateOrdinals {
  return {
    type: actions.ChangeHasActivatedOrdinalsKey,
    hasActivatedOrdinalsKey,
  };
}

export function ChangeActivateDLCsAction(hasActivatedDLCsKey: boolean): actions.ChangeActivateDLCs {
  return {
    type: actions.ChangeHasActivatedDLCsKey,
    hasActivatedDLCsKey,
  };
}

export function ChangeShowBtcReceiveAlertAction(showBtcReceiveAlert: boolean | null): actions.ChangeShowBtcReceiveAlert {
  return {
    type: actions.ChangeShowBtcReceiveAlertKey,
    showBtcReceiveAlert,
  };
}

export function ChangeShowOrdinalReceiveAlertAction(showOrdinalReceiveAlert: boolean | null): actions.ChangeShowOrdinalReceiveAlert {
  return {
    type: actions.ChangeShowOrdinalReceiveAlertKey,
    showOrdinalReceiveAlert,
  };
}
