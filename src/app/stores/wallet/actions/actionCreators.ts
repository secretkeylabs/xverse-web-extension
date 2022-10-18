import {
  Coin,
  FungibleToken,
  NetworkType,
  SupportedCurrency,
  TransactionData,
} from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';
import * as actions from './types';
import { Account } from './types';

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

export function storeEncryptedSeedAction(encryptedSeed: string): actions.StoreEncryptedSeed {
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
  masterPubKey: string,
  stxPublicKey: string,
  btcPublicKey: string,
  network: NetworkType,
  // stackingState: StackingStateData,
  bnsName?: string
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

export function fetchRatesAction(fiatCurrency: SupportedCurrency): actions.FetchRates {
  return {
    type: actions.FetchRatesKey,
    fiatCurrency,
  };
}

export function fetchRatesSuccessAction(
  stxBtcRate: BigNumber,
  btcFiatRate: BigNumber
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
  network: NetworkType,
  fiatCurrency: string,
  stxBtcRate: BigNumber
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
  stxNonce: number
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
  btcFiatRate: BigNumber
): actions.FetchBtcWalletDataRequest {
  return {
    type: actions.FetchBtcWalletDataRequestKey,
    btcAddress,
    network,
    stxBtcRate,
    btcFiatRate,
  };
}

export function fetchBtcWalletDataSuccess(balance: BigNumber): actions.FetchBtcWalletDataSuccess {
  return {
    type: actions.FetchBtcWalletDataSuccessKey,
    balance,
  };
}

export function fetchBtcWalletDataFail(): actions.FetchBtcWalletDataFail {
  return {
    type: actions.FetchBtcWalletDataFailureKey,
  };
}

export function fetchCoinDataRequestAction(
  stxAddress: string,
  network: NetworkType,
  fiatCurrency: string,
  coinsList: FungibleToken[] | null
): actions.FetchCoinDataRequest {
  return {
    type: actions.FetchCoinDataRequestKey,
    stxAddress: stxAddress,
    network: network,
    fiatCurrency: fiatCurrency,
    coinsList: coinsList,
  };
}

export function FetchCoinDataSuccessAction(
  coinsList: FungibleToken[],
  supportedCoins: Coin[]
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
  coinsList: FungibleToken[]
): actions.UpdateVisibleCoinList {
  return {
    type: actions.UpdateVisibleCoinListKey,
    coinsList,
  };
}
