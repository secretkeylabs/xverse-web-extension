import { PostGuardPing } from '@components/guards/singleTab';
import type {
  Account,
  AccountType,
  AppInfo,
  BaseWallet,
  Coin,
  FungibleToken,
  SettingsNetwork,
  SupportedCurrency,
  TransactionData,
} from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import * as actions from './types';

export function setWalletAction(wallet: BaseWallet): actions.SetWallet {
  return {
    type: actions.SetWalletKey,
    wallet,
  };
}

export function storeEncryptedSeedAction(encryptedSeed: string): actions.StoreEncryptedSeed {
  return {
    type: actions.StoreEncryptedSeedKey,
    encryptedSeed,
  };
}

export function resetWalletAction(): actions.ResetWallet {
  // We post the closeWallet action to the guard so that any open tabs will close
  PostGuardPing('closeWallet');
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

export function addAccountAction(accountsList: Account[]): actions.AddAccount {
  return {
    type: actions.AddAccountKey,
    accountsList,
  };
}

export function updateLedgerAccountsAction(
  ledgerAccountsList: Account[],
): actions.AddLedgerAccount {
  return {
    type: actions.UpdateLedgerAccountsKey,
    ledgerAccountsList,
  };
}

export function selectAccount(
  selectedAccount: Account,
  stxAddress: string,
  btcAddress: string,
  ordinalsAddress: string,
  masterPubKey: string,
  stxPublicKey: string,
  btcPublicKey: string,
  ordinalsPublicKey: string,
  network: SettingsNetwork,
  // stackingState: StackingStateData,
  bnsName?: string,
  accountType?: AccountType,
  accountName?: string,
): actions.SelectAccount {
  return {
    type: actions.SelectAccountKey,
    selectedAccount,
    stxAddress,
    btcAddress,
    ordinalsAddress,
    masterPubKey,
    stxPublicKey,
    btcPublicKey,
    ordinalsPublicKey,
    network,
    // stackingState,
    bnsName,
    accountType,
    accountName,
  };
}

export function setFeeMultiplierAction(feeMultipliers: AppInfo): actions.SetFeeMultiplier {
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

export function ChangeFiatCurrencyAction(
  fiatCurrency: SupportedCurrency,
): actions.ChangeFiatCurrency {
  return {
    type: actions.ChangeFiatCurrencyKey,
    fiatCurrency,
  };
}

export function ChangeNetworkAction(
  network: SettingsNetwork,
  networkAddress: string | undefined,
  btcApiUrl: string,
): actions.ChangeNetwork {
  return {
    type: actions.ChangeNetworkKey,
    network,
    networkAddress,
    btcApiUrl,
  };
}

export function getActiveAccountsAction(accountsList: Account[]): actions.GetActiveAccounts {
  return {
    type: actions.GetActiveAccountsKey,
    accountsList,
  };
}

export function ChangeActivateOrdinalsAction(
  hasActivatedOrdinalsKey: boolean,
): actions.ChangeActivateOrdinals {
  return {
    type: actions.ChangeHasActivatedOrdinalsKey,
    hasActivatedOrdinalsKey,
  };
}

export function ChangeActivateRareSatsAction(
  hasActivatedRareSatsKey: boolean,
): actions.ChangeActivateRareSats {
  return {
    type: actions.ChangeHasActivatedRareSatsKey,
    hasActivatedRareSatsKey,
  };
}

export function ChangeActivateRBFAction(hasActivatedRBFKey: boolean): actions.ChangeActivateRBF {
  return {
    type: actions.ChangeHasActivatedRBFKey,
    hasActivatedRBFKey,
  };
}

export function SetRareSatsNoticeDismissedAction(
  rareSatsNoticeDismissed: boolean,
): actions.SetRareSatsNoticeDismissed {
  return {
    type: actions.RareSatsNoticeDismissedKey,
    rareSatsNoticeDismissed,
  };
}

export function ChangeShowBtcReceiveAlertAction(
  showBtcReceiveAlert: boolean | null,
): actions.ChangeShowBtcReceiveAlert {
  return {
    type: actions.ChangeShowBtcReceiveAlertKey,
    showBtcReceiveAlert,
  };
}

export function ChangeShowOrdinalReceiveAlertAction(
  showOrdinalReceiveAlert: boolean | null,
): actions.ChangeShowOrdinalReceiveAlert {
  return {
    type: actions.ChangeShowOrdinalReceiveAlertKey,
    showOrdinalReceiveAlert,
  };
}

export function changeShowDataCollectionAlertAction(
  showDataCollectionAlert: boolean | null,
): actions.ChangeShowDataCollectionAlert {
  return {
    type: actions.ChangeShowDataCollectionAlertKey,
    showDataCollectionAlert,
  };
}

export function setBrcCoinsDataAction(brcCoinsList: FungibleToken[]): actions.SetBrcCoinsData {
  return {
    type: actions.SetBrcCoinsListKey,
    brcCoinsList,
  };
}

export function setWalletLockPeriodAction(
  walletLockPeriod: actions.WalletSessionPeriods,
): actions.SetWalletLockPeriod {
  return {
    type: actions.SetWalletLockPeriodKey,
    walletLockPeriod,
  };
}

export function setWalletUnlockedAction(isUnlocked: boolean): actions.SetWalletUnlocked {
  return {
    type: actions.SetWalletUnlockedKey,
    isUnlocked,
  };
}
