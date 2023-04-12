import {
  Coin,
  FeesMultipliers,
  FungibleToken,
  SupportedCurrency,
  TransactionData,
  Account,
  BaseWallet,
  SettingsNetwork,
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
export const SetFeeMultiplierKey = 'SetFeeMultiplierKey';
export const ChangeFiatCurrencyKey = 'ChangeFiatCurrency';
export const ChangeNetworkKey = 'ChangeNetwork';
export const GetActiveAccountsKey = 'GetActiveAccounts';
export const SetWalletSeedPhraseKey = 'SetWalletSeed';

export const FetchStxWalletDataRequestKey = 'FetchStxWalletDataRequest';
export const SetStxWalletDataKey = 'SetStxWalletDataKey';

export const SetBtcWalletDataKey = 'SetBtcWalletData';

export const SetCoinRatesKey = 'SetCoinRatesKey';

export const SetCoinDataKey = 'SetCoinDataKey';

export const ChangeHasActivatedOrdinalsKey = 'ChangeHasActivatedOrdinalsKey';

export const ChangeHasActivatedDLCsKey = 'ChangeHasActivatedDLCsKey';

export const ChangeShowBtcReceiveAlertKey = 'ChangeShowBtcReceiveAlertKey';
export const ChangeShowDlcBtcReceiveAlertKey = 'ChangeShowDlcBtcReceiveAlertKey';
export const ChangeShowOrdinalReceiveAlertKey = 'ChangeShowOrdinalReceiveAlertKey';

export interface WalletState {
  stxAddress: string;
  btcAddress: string;
  dlcBtcAddress: string;
  ordinalsAddress: string;
  masterPubKey: string;
  dlcBtcPublicKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  ordinalsPublicKey: string;
  accountsList: Account[];
  selectedAccount: Account | null;
  network: SettingsNetwork;
  seedPhrase: string;
  encryptedSeed: string;
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
  networkAddress: string | undefined;
  hasActivatedOrdinalsKey: boolean | undefined;
  hasActivatedDLCsKey: boolean | undefined;
  showBtcReceiveAlert: boolean | null;
  showDlcBtcReceiveAlert: boolean | null;
  showOrdinalReceiveAlert: boolean | null;
}

export interface WalletData {
  stxAddress: string;
  btcAddress: string;
  dlcBtcAddress: string;
  masterPubKey: string;
  dlcBtcPublicKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  seedPhrase: string;
  networkAddress: string | undefined;
  hasActivatedOrdinalsKey: boolean | undefined;
  hasActivatedDLCsKey: boolean | undefined;
  showBtcReceiveAlert: boolean | null;
  showDlcBtcReceiveAlert: boolean | null;
  showOrdinalReceiveAlert: boolean | null;
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

export interface SetFeeMultiplier {
  type: typeof SetFeeMultiplierKey;
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
  dlcBtcAddress: string;
  ordinalsAddress: string;
  masterPubKey: string;
  dlcBtcPublicKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  ordinalsPublicKey: string;
  bnsName?: string;
  network: SettingsNetwork;
  // stackingState: StackingStateData;
}
export interface SetCoinRates {
  type: typeof SetCoinRatesKey;
  stxBtcRate: BigNumber;
  btcFiatRate: BigNumber;
}

export interface SetStxWalletData {
  type: typeof SetStxWalletDataKey;
  stxBalance: BigNumber;
  stxAvailableBalance: BigNumber;
  stxLockedBalance: BigNumber;
  stxTransactions: TransactionData[];
  stxNonce: number;
}

export interface SetBtcWalletData {
  type: typeof SetBtcWalletDataKey;
  balance: BigNumber;
}

export interface SetCoinData {
  type: typeof SetCoinDataKey;
  coinsList: FungibleToken[];
  supportedCoins: Coin[];
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
  networkAddress: string;
}

export interface GetActiveAccounts {
  type: typeof GetActiveAccountsKey;
  accountsList: Account[];
}

export interface ChangeActivateOrdinals {
  type: typeof ChangeHasActivatedOrdinalsKey;
  hasActivatedOrdinalsKey: boolean;
}

export interface ChangeActivateDLCs {
  type: typeof ChangeHasActivatedDLCsKey;
  hasActivatedDLCsKey: boolean;
}

export interface ChangeShowBtcReceiveAlert {
  type: typeof ChangeShowBtcReceiveAlertKey;
  showBtcReceiveAlert: boolean | null;
}

export interface ChangeShowDlcBtcReceiveAlert {
  type: typeof ChangeShowDlcBtcReceiveAlertKey;
  showDlcBtcReceiveAlert: boolean | null;
}
export interface ChangeShowOrdinalReceiveAlert {
  type: typeof ChangeShowOrdinalReceiveAlertKey;
  showOrdinalReceiveAlert: boolean | null;
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
  | SetFeeMultiplier
  | SetCoinRates
  | SetStxWalletData
  | SetBtcWalletData
  | SetCoinData
  | UpdateVisibleCoinList
  | ChangeFiatCurrency
  | ChangeNetwork
  | GetActiveAccounts
  | ChangeActivateOrdinals
  | ChangeActivateDLCs
  | ChangeShowBtcReceiveAlert
  | ChangeShowDlcBtcReceiveAlert
  | ChangeShowOrdinalReceiveAlert;
