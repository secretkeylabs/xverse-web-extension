import {
  Account,
  AccountType,
  AppInfo,
  BaseWallet,
  Coin,
  FungibleToken,
  SettingsNetwork,
  SupportedCurrency,
  TransactionData,
} from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';

export const SetWalletKey = 'SetWallet';
export const ResetWalletKey = 'ResetWallet';
export const FetchAccountKey = 'FetchAccount';
export const SelectAccountKey = 'SelectAccount';
export const StoreEncryptedSeedKey = 'StoreEncryptedSeed';
export const UpdateVisibleCoinListKey = 'UpdateVisibleCoinList';
export const AddAccountKey = 'AddAccount';
export const SetFeeMultiplierKey = 'SetFeeMultiplierKey';
export const ChangeFiatCurrencyKey = 'ChangeFiatCurrency';
export const ChangeNetworkKey = 'ChangeNetwork';
export const GetActiveAccountsKey = 'GetActiveAccounts';

export const FetchStxWalletDataRequestKey = 'FetchStxWalletDataRequest';
export const SetStxWalletDataKey = 'SetStxWalletDataKey';

export const SetBtcWalletDataKey = 'SetBtcWalletData';

export const SetCoinRatesKey = 'SetCoinRatesKey';

export const SetCoinDataKey = 'SetCoinDataKey';

export const ChangeHasActivatedOrdinalsKey = 'ChangeHasActivatedOrdinalsKey';
export const RareSatsNoticeDismissedKey = 'RareSatsNoticeDismissedKey';
export const ChangeHasActivatedRareSatsKey = 'ChangeHasActivatedRareSatsKey';

export const ChangeShowBtcReceiveAlertKey = 'ChangeShowBtcReceiveAlertKey';
export const ChangeShowOrdinalReceiveAlertKey = 'ChangeShowOrdinalReceiveAlertKey';
export const ChangeShowDataCollectionAlertKey = 'ChangeShowDataCollectionAlertKey';
export const UpdateLedgerAccountsKey = 'UpdateLedgerAccountsKey';

export const SetBrcCoinsListKey = 'SetBrcCoinsList';

export const SetWalletLockPeriodKey = 'SetWalletLockPeriod';

export const SetWalletUnlockedKey = 'SetWalletUnlocked';

export enum WalletSessionPeriods {
  LOW = 1,
  STANDARD = 10,
  LONG = 30,
}

export interface WalletState {
  stxAddress: string;
  btcAddress: string;
  ordinalsAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  ordinalsPublicKey: string;
  accountsList: Account[];
  ledgerAccountsList: Account[];
  selectedAccount: Account | null;
  network: SettingsNetwork;
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
  brcCoinsList: FungibleToken[] | null;
  feeMultipliers: AppInfo | null;
  networkAddress: string | undefined;
  hasActivatedOrdinalsKey: boolean | undefined;
  hasActivatedRareSatsKey: boolean | undefined;
  rareSatsNoticeDismissed: boolean | undefined;
  showBtcReceiveAlert: boolean | null;
  showOrdinalReceiveAlert: boolean | null;
  showDataCollectionAlert: boolean | null;
  accountType: AccountType | undefined;
  accountName: string | undefined;
  btcApiUrl: string;
  walletLockPeriod: WalletSessionPeriods;
  isUnlocked: boolean;
}

export interface SetWallet {
  type: typeof SetWalletKey;
  wallet: BaseWallet;
}

export interface StoreEncryptedSeed {
  type: typeof StoreEncryptedSeedKey;
  encryptedSeed: string;
}
export interface SetFeeMultiplier {
  type: typeof SetFeeMultiplierKey;
  feeMultipliers: AppInfo;
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
export interface AddLedgerAccount {
  type: typeof UpdateLedgerAccountsKey;
  ledgerAccountsList: Account[];
}
export interface SelectAccount {
  type: typeof SelectAccountKey;
  selectedAccount: Account | null;
  stxAddress: string;
  btcAddress: string;
  ordinalsAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  ordinalsPublicKey: string;
  bnsName?: string;
  network: SettingsNetwork;
  // stackingState: StackingStateData;
  accountType?: AccountType;
  accountName: string | undefined;
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
  networkAddress: string | undefined;
  btcApiUrl: string;
}

export interface GetActiveAccounts {
  type: typeof GetActiveAccountsKey;
  accountsList: Account[];
}

export interface ChangeActivateOrdinals {
  type: typeof ChangeHasActivatedOrdinalsKey;
  hasActivatedOrdinalsKey: boolean;
}

export interface ChangeActivateRareSats {
  type: typeof ChangeHasActivatedRareSatsKey;
  hasActivatedRareSatsKey: boolean;
}

export interface SetRareSatsNoticeDismissed {
  type: typeof RareSatsNoticeDismissedKey;
  rareSatsNoticeDismissed: boolean;
}

export interface ChangeShowBtcReceiveAlert {
  type: typeof ChangeShowBtcReceiveAlertKey;
  showBtcReceiveAlert: boolean | null;
}

export interface ChangeShowOrdinalReceiveAlert {
  type: typeof ChangeShowOrdinalReceiveAlertKey;
  showOrdinalReceiveAlert: boolean | null;
}

export interface ChangeShowDataCollectionAlert {
  type: typeof ChangeShowDataCollectionAlertKey;
  showDataCollectionAlert: boolean | null;
}

export interface SetBrcCoinsData {
  type: typeof SetBrcCoinsListKey;
  brcCoinsList: FungibleToken[];
}

export interface SetWalletLockPeriod {
  type: typeof SetWalletLockPeriodKey;
  walletLockPeriod: WalletSessionPeriods;
}
export interface SetWalletUnlocked {
  type: typeof SetWalletUnlockedKey;
  isUnlocked: boolean;
}
export type WalletActions =
  | SetWallet
  | ResetWallet
  | FetchAccount
  | AddAccount
  | AddLedgerAccount
  | SelectAccount
  | StoreEncryptedSeed
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
  | ChangeActivateRareSats
  | ChangeShowBtcReceiveAlert
  | ChangeShowOrdinalReceiveAlert
  | ChangeShowDataCollectionAlert
  | SetBrcCoinsData
  | SetWalletLockPeriod
  | SetRareSatsNoticeDismissed
  | SetWalletUnlocked;
