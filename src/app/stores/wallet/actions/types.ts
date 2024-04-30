import type {
  Account,
  AccountType,
  AppInfo,
  BaseWallet,
  SettingsNetwork,
  SupportedCurrency,
} from '@secretkeylabs/xverse-core';

export const SetWalletKey = 'SetWallet';
export const ResetWalletKey = 'ResetWallet';
export const FetchAccountKey = 'FetchAccount';
export const SelectAccountKey = 'SelectAccount';
export const StoreEncryptedSeedKey = 'StoreEncryptedSeed';
export const AddAccountKey = 'AddAccount';
export const SetFeeMultiplierKey = 'SetFeeMultiplierKey';
export const ChangeFiatCurrencyKey = 'ChangeFiatCurrency';
export const ChangeNetworkKey = 'ChangeNetwork';
export const GetActiveAccountsKey = 'GetActiveAccounts';
export const ChangeHasActivatedOrdinalsKey = 'ChangeHasActivatedOrdinalsKey';
export const RareSatsNoticeDismissedKey = 'RareSatsNoticeDismissedKey';
export const ChangeHasActivatedRareSatsKey = 'ChangeHasActivatedRareSatsKey';
export const ChangeHasActivatedRBFKey = 'ChangeHasActivatedRBFKey';
export const ChangeShowBtcReceiveAlertKey = 'ChangeShowBtcReceiveAlertKey';
export const ChangeShowOrdinalReceiveAlertKey = 'ChangeShowOrdinalReceiveAlertKey';
export const ChangeShowDataCollectionAlertKey = 'ChangeShowDataCollectionAlertKey';
export const UpdateLedgerAccountsKey = 'UpdateLedgerAccountsKey';
export const SetSip10ManageTokensKey = 'SetSip10ManageTokensKey';
export const SetBrc20ManageTokensKey = 'SetBrc20ManageTokensKey';
export const SetRunesManageTokensKey = 'SetRunesManageTokens';
export const SetNotificationBannersKey = 'SetNotificationBanners';
export const SetWalletLockPeriodKey = 'SetWalletLockPeriod';
export const SetWalletUnlockedKey = 'SetWalletUnlocked';
export const RenameAccountKey = 'RenameAccountKey';
export const SetAccountBalanceKey = 'SetAccountBalanceKey';
export const SetWalletHideStxKey = 'SetWalletHideStx';

export enum WalletSessionPeriods {
  LOW = 15,
  STANDARD = 30,
  LONG = 60,
  VERY_LONG = 180,
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
  network: SettingsNetwork; // currently selected network urls and type
  savedNetworks: SettingsNetwork[]; // previously set network urls for type
  encryptedSeed: string;
  fiatCurrency: SupportedCurrency;
  sip10ManageTokens: Record<string, boolean>;
  brc20ManageTokens: Record<string, boolean>;
  runesManageTokens: Record<string, boolean>;
  notificationBanners: Record<string, boolean>;
  feeMultipliers: AppInfo | null;
  hasActivatedOrdinalsKey: boolean | undefined;
  hasActivatedRareSatsKey: boolean | undefined;
  hasActivatedRBFKey: boolean | undefined;
  rareSatsNoticeDismissed: boolean | undefined;
  showBtcReceiveAlert: boolean | null;
  showOrdinalReceiveAlert: boolean | null;
  showDataCollectionAlert: boolean | null;
  accountType: AccountType | undefined;
  accountName: string | undefined;
  walletLockPeriod: WalletSessionPeriods;
  isUnlocked: boolean;
  accountBalances: {
    [key: string]: string;
  };
  hideStx: boolean;
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

export interface ChangeActivateOrdinals {
  type: typeof ChangeHasActivatedOrdinalsKey;
  hasActivatedOrdinalsKey: boolean;
}

export interface ChangeActivateRareSats {
  type: typeof ChangeHasActivatedRareSatsKey;
  hasActivatedRareSatsKey: boolean;
}

export interface ChangeActivateRBF {
  type: typeof ChangeHasActivatedRBFKey;
  hasActivatedRBFKey: boolean;
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

export interface SetSip10ManageTokens {
  type: typeof SetSip10ManageTokensKey;
  principal: string;
  isEnabled: boolean;
}

export interface SetBrc20ManageTokens {
  type: typeof SetBrc20ManageTokensKey;
  principal: string;
  isEnabled: boolean;
}

export interface SetRunesManageTokens {
  type: typeof SetRunesManageTokensKey;
  principal: string;
  isEnabled: boolean;
}

export interface SetNotificationBanners {
  type: typeof SetNotificationBannersKey;
  id: string;
  isDismissed: boolean;
}

export interface SetWalletLockPeriod {
  type: typeof SetWalletLockPeriodKey;
  walletLockPeriod: WalletSessionPeriods;
}
export interface SetWalletUnlocked {
  type: typeof SetWalletUnlockedKey;
  isUnlocked: boolean;
}

export interface RenameAccount {
  type: typeof RenameAccountKey;
  accountsList: Account[];
  selectedAccount: Account | null;
}

export interface SetAccountBalance {
  type: typeof SetAccountBalanceKey;
  btcAddress: string;
  totalBalance: string;
}

export interface SetWalletHideStx {
  type: typeof SetWalletHideStxKey;
  hideStx: boolean;
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
  | ChangeFiatCurrency
  | ChangeNetwork
  | GetActiveAccounts
  | ChangeActivateOrdinals
  | ChangeActivateRareSats
  | ChangeActivateRBF
  | ChangeShowBtcReceiveAlert
  | ChangeShowOrdinalReceiveAlert
  | ChangeShowDataCollectionAlert
  | SetSip10ManageTokens
  | SetBrc20ManageTokens
  | SetRunesManageTokens
  | SetNotificationBanners
  | SetWalletLockPeriod
  | SetRareSatsNoticeDismissed
  | SetWalletUnlocked
  | RenameAccount
  | SetAccountBalance
  | SetWalletHideStx;
