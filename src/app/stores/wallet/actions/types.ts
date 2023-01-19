import {
  BtcTransactionData,
  Coin,
  FeesMultipliers,
  FungibleToken,
  NetworkType,
  SettingsNetwork,
  SupportedCurrency,
  TransactionData,
  Account,
  BaseWallet,
} from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';

export const SetWalletKey = 'SetWallet';
export const ResetWalletKey = 'ResetWallet';
export const FetchAccountKey = 'FetchAccount';
export const SelectAccountKey = 'SelectAccount';
export const UnlockWalletKey = 'UnlockWallet';
export const LockWalletKey = 'LockWallet';
export const StoreEncryptedSeedKey = 'StoreEncryptedSeed';
export const UpdateVisibleCoinListKey = 'UpdateVisibleCoinList';
export const AddAccountKey = 'AddAccount';
export const FetchFeeMultiplierKey = 'FetchFeeMultiplier';
export const ChangeFiatCurrencyKey = 'ChangeFiatCurrency';
export const ChangeNetworkKey = 'ChangeNetwork';
export const GetActiveAccountsKey = 'GetActiveAccounts';
export const SetWalletSeedPhraseKey = 'SetWalletSeed';

export const FetchStxWalletDataRequestKey = 'FetchStxWalletDataRequest';
export const FetchStxWalletDataSuccessKey = 'FetchStxWalletDataSuccess';
export const FetchStxWalletDataFailureKey = 'FetchStxWalletDataFailure';

export const FetchBtcWalletDataRequestKey = 'FetchBtcWalletDataRequest';
export const FetchBtcWalletDataSuccessKey = 'FetchBtcWalletDataSuccess';
export const FetchBtcWalletDataFailureKey = 'FetchBtcWalletDataFailure';

export const FetchRatesKey = 'FetchRates';
export const FetchRatesSuccessKey = 'FetchRatesSuccess';
export const FetchRatesFailureKey = 'FetchRatesFailure';

export const FetchCoinDataRequestKey = 'FetchCoinDataRequest';
export const FetchCoinDataSuccessKey = 'FetchCoinDataSuccess';
export const FetchCoinDataFailureKey = 'FetchCoinDataFailure';
export interface WalletState {
  stxAddress: string;
  btcAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  accountsList: Account[];
  selectedAccount: Account | null;
  hasRestoredMemoryKey: boolean;
  network: SettingsNetwork;
  seedPhrase: string;
  encryptedSeed: string;
  loadingWalletData: boolean;
  loadingBtcData: boolean;
  fiatCurrency: SupportedCurrency;
  btcFiatRate: BigNumber;
  stxBtcRate: BigNumber;
  stxBalance: BigNumber;
  stxAvailableBalance: BigNumber;
  stxLockedBalance: BigNumber;
  stxNonce: number;
  btcBalance: BigNumber;
  coinsList: FungibleToken[] | null;
  coins: Coin[];
  feeMultipliers: FeesMultipliers | null;
}

export interface SetWallet {
  type: typeof SetWalletKey;
  wallet: BaseWallet;
}

export interface StoreEncryptedSeed {
  type: typeof StoreEncryptedSeedKey;
  encryptedSeed: string;
}

export interface SetWalletSeedPhrase {
  type: typeof SetWalletSeedPhraseKey;
  seedPhrase: string;
}
export interface UnlockWallet {
  type: typeof UnlockWalletKey;
  seed: string;
}

export interface FetchFeeMultiplier {
  type: typeof FetchFeeMultiplierKey;
  feeMultipliers: FeesMultipliers;
}

export interface LockWallet {
  type: typeof LockWalletKey;
}
export interface ResetWallet {
  type: typeof ResetWalletKey;
}

export interface FetchAccount {
  type: typeof FetchAccountKey;
  selectedAccount: Account | null;
  accountsList: Account[];
}

export interface AddAccount {
  type: typeof AddAccountKey;
  accountsList: Account[];
}
export interface SelectAccount {
  type: typeof SelectAccountKey;
  selectedAccount: Account | null;
  stxAddress: string;
  btcAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  bnsName?: string;
  network: SettingsNetwork;
  // stackingState: StackingStateData;
}

export interface FetchRates {
  type: typeof FetchRatesKey;
  fiatCurrency: SupportedCurrency;
}

export interface FetchRatesSuccess {
  type: typeof FetchRatesSuccessKey;
  stxBtcRate: BigNumber;
  btcFiatRate: BigNumber;
}

export interface FetchRatesFail {
  type: typeof FetchRatesFailureKey;
  error: string;
}

export interface FetchStxWalletDataRequest {
  type: typeof FetchStxWalletDataRequestKey;
  stxAddress: string;
  network: SettingsNetwork;
  fiatCurrency: string;
  stxBtcRate: BigNumber;
}

export interface FetchStxWalletDataSuccess {
  type: typeof FetchStxWalletDataSuccessKey;
  stxBalance: BigNumber;
  stxAvailableBalance: BigNumber;
  stxLockedBalance: BigNumber;
  stxTransactions: TransactionData[];
  stxNonce: number;
}

export interface FetchStxWalletDataFail {
  type: typeof FetchStxWalletDataFailureKey;
}

export interface FetchBtcWalletDataRequest {
  type: typeof FetchBtcWalletDataRequestKey;
  btcAddress: string;
  network: NetworkType;
  stxBtcRate: BigNumber;
  btcFiatRate: BigNumber;
}

export interface FetchBtcWalletDataSuccess {
  type: typeof FetchBtcWalletDataSuccessKey;
  balance: BigNumber;
  btctransactions: BtcTransactionData[];
}

export interface FetchBtcWalletDataFail {
  type: typeof FetchBtcWalletDataFailureKey;
}

export interface FetchCoinDataRequest {
  type: typeof FetchCoinDataRequestKey;
  stxAddress: string;
  network: SettingsNetwork;
  fiatCurrency: string;
  coinsList: FungibleToken[] | null;
}

export interface FetchCoinDataSuccess {
  type: typeof FetchCoinDataSuccessKey;
  coinsList: FungibleToken[];
  supportedCoins: Coin[];
}

export interface FetchCoinDataFailure {
  type: typeof FetchCoinDataFailureKey;
  error: string;
}
export interface UpdateVisibleCoinList {
  type: typeof UpdateVisibleCoinListKey;
  coinsList: FungibleToken[];
}

export interface ChangeFiatCurrency {
  type: typeof ChangeFiatCurrencyKey;
  fiatCurrency: SupportedCurrency;
}
export interface ChangeNetwork {
  type: typeof ChangeNetworkKey;
  network: SettingsNetwork;
}

export interface GetActiveAccounts {
  type: typeof GetActiveAccountsKey;
  accountsList: Account[];
}

export type WalletActions =
  | SetWallet
  | ResetWallet
  | FetchAccount
  | AddAccount
  | SelectAccount
  | StoreEncryptedSeed
  | SetWalletSeedPhrase
  | UnlockWallet
  | LockWallet
  | FetchFeeMultiplier
  | FetchRates
  | FetchRatesSuccess
  | FetchRatesFail
  | FetchStxWalletDataRequest
  | FetchStxWalletDataSuccess
  | FetchStxWalletDataFail
  | FetchBtcWalletDataFail
  | FetchBtcWalletDataSuccess
  | FetchBtcWalletDataRequest
  | FetchCoinDataRequest
  | FetchCoinDataSuccess
  | FetchCoinDataFailure
  | UpdateVisibleCoinList
  | ChangeFiatCurrency
  | ChangeNetwork
  | GetActiveAccounts;
