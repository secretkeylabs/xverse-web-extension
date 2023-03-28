import {
  Account,
  BtcTransactionData,
  Coin,
  FeesMultipliers,
  FungibleToken,
  NetworkType,
  SettingsNetwork,
  SupportedCurrency,
  TransactionData,
} from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';
import * as actions from './types';

export function setWalletAction(wallet: actions.WalletData): actions.SetWallet {
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
  masterPubKey: string,
  stxPublicKey: string,
  btcPublicKey: string,
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
    masterPubKey,
    stxPublicKey,
    btcPublicKey,
    network,
    // stackingState,
    bnsName,
  };
}

export function FetchFeeMultiplierAction(feeMultipliers: FeesMultipliers): actions.FetchFeeMultiplier {
  return {
    type: actions.FetchFeeMultiplierKey,
    feeMultipliers,
  };
}

export function fetchRatesAction(fiatCurrency: SupportedCurrency): actions.FetchRates {
  return {
    type: actions.FetchRatesKey,
    fiatCurrency,
  };
}

export function fetchRatesSuccessAction(
  stxBtcRate: BigNumber,
  btcFiatRate: BigNumber,
): actions.FetchRatesSuccess {
  return {
    type: actions.FetchRatesSuccessKey,
    stxBtcRate,
    btcFiatRate,
  };
}

export function fetchRatesFailAction(error: string): actions.FetchRatesFail {
  return {
    type: actions.FetchRatesFailureKey,
    error,
  };
}

export function fetchStxWalletDataRequestAction(
  stxAddress: string,
  network: SettingsNetwork,
  fiatCurrency: string,
  stxBtcRate: BigNumber,
): actions.FetchStxWalletDataRequest {
  return {
    type: actions.FetchStxWalletDataRequestKey,
    stxAddress,
    network,
    fiatCurrency,
    stxBtcRate,
  };
}

export function fetchStxWalletDataSuccessAction(
  stxBalance: BigNumber,
  stxAvailableBalance: BigNumber,
  stxLockedBalance: BigNumber,
  stxTransactions: TransactionData[],
  stxNonce: number,
): actions.FetchStxWalletDataSuccess {
  return {
    type: actions.FetchStxWalletDataSuccessKey,
    stxBalance,
    stxAvailableBalance,
    stxLockedBalance,
    stxTransactions,
    stxNonce,
  };
}

export function fetchStxWalletDataFailureAction() {
  return {
    type: actions.FetchStxWalletDataFailureKey,
  };
}

export function fetchBtcWalletDataRequestAction(
  btcAddress: string,
  network: NetworkType,
  stxBtcRate: BigNumber,
  btcFiatRate: BigNumber,
): actions.FetchBtcWalletDataRequest {
  return {
    type: actions.FetchBtcWalletDataRequestKey,
    btcAddress,
    network,
    stxBtcRate,
    btcFiatRate,
  };
}

export function fetchBtcWalletDataSuccess(balance: BigNumber, btctransactions: BtcTransactionData[]): actions.FetchBtcWalletDataSuccess {
  return {
    type: actions.FetchBtcWalletDataSuccessKey,
    balance,
    btctransactions,
  };
}

export function fetchBtcWalletDataFail(): actions.FetchBtcWalletDataFail {
  return {
    type: actions.FetchBtcWalletDataFailureKey,
  };
}

export function fetchCoinDataRequestAction(
  stxAddress: string,
  network: SettingsNetwork,
  fiatCurrency: string,
  coinsList: FungibleToken[] | null,
): actions.FetchCoinDataRequest {
  return {
    type: actions.FetchCoinDataRequestKey,
    stxAddress,
    network,
    fiatCurrency,
    coinsList,
  };
}

export function FetchCoinDataSuccessAction(
  coinsList: FungibleToken[],
  supportedCoins: Coin[],
): actions.FetchCoinDataSuccess {
  return {
    type: actions.FetchCoinDataSuccessKey,
    coinsList,
    supportedCoins,
  };
}

export function FetchCoinDataFailureAction(error: string): actions.FetchCoinDataFailure {
  return {
    type: actions.FetchCoinDataFailureKey,
    error,
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

export function ChangeNetworkAction(network: SettingsNetwork): actions.ChangeNetwork {
  return {
    type: actions.ChangeNetworkKey,
    network,
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
