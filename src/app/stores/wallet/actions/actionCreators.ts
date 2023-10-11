import { PostGuardPing } from '@components/guards/singleTab';
import { AccountType, AppInfo } from '@secretkeylabs/xverse-core';
import {
  Account,
  BaseWallet,
  Coin,
  FungibleToken,
  SettingsNetwork,
  SupportedCurrency,
  TransactionData,
} from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';
import * as actions from './types';

type NumberLike = string | number | bigint | BigNumber;

function numberLikeToStringOrThrow(value: NumberLike, name: string): string {
  if (typeof value !== 'bigint' && BigNumber(value).isNaN()) {
    throw new Error(`Invalid value for ${name}: ${value}`);
  }

  return `${value}`;
}

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
  // We post the closeWallet action to the guard so that any open tabs will close
  PostGuardPing('closeWallet');
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

export function setWalletSeedPhraseAction(seedPhrase: string): actions.SetWalletSeedPhrase {
  return {
    type: actions.SetWalletSeedPhraseKey,
    seedPhrase,
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
  stxBtcRate: NumberLike,
  btcFiatRate: NumberLike,
): actions.SetCoinRates {
  return {
    type: actions.SetCoinRatesKey,
    stxBtcRate: numberLikeToStringOrThrow(stxBtcRate, 'stx fiat rate'),
    btcFiatRate: numberLikeToStringOrThrow(btcFiatRate, 'btc fiat rate'),
  };
}

export function setStxWalletDataAction(
  stxBalance: NumberLike,
  stxAvailableBalance: NumberLike,
  stxLockedBalance: NumberLike,
  stxTransactions: TransactionData[],
  stxNonce: number,
): actions.SetStxWalletData {
  return {
    type: actions.SetStxWalletDataKey,
    stxBalance: numberLikeToStringOrThrow(stxBalance, 'stx balance'),
    stxAvailableBalance: numberLikeToStringOrThrow(stxAvailableBalance, 'stx available'),
    stxLockedBalance: numberLikeToStringOrThrow(stxLockedBalance, 'stx locked'),
    stxTransactions,
    stxNonce,
  };
}

export function SetBtcWalletDataAction(balance: NumberLike): actions.SetBtcWalletData {
  return {
    type: actions.SetBtcWalletDataKey,
    balance: numberLikeToStringOrThrow(balance, 'bitcoin balance'),
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
