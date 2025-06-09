import type {
  Account,
  AccountType,
  AppInfo,
  BtcPaymentType,
  DerivationType,
  FungibleToken,
  Inscription,
  NetworkType,
  NftData,
  SettingsNetwork,
  SupportedCurrency,
  WalletId,
} from '@secretkeylabs/xverse-core';

export const ResetWalletKey = 'ResetWallet';
export const SelectAccountKey = 'SelectAccount';
export const StoreEncryptedSeedKey = 'StoreEncryptedSeed';
export const UpdateSoftwareWalletsKey = 'UpdateSoftwareWalletsKey';
export const SetFeeMultiplierKey = 'SetFeeMultiplierKey';
export const ChangeFiatCurrencyKey = 'ChangeFiatCurrency';
export const ChangeNetworkKey = 'ChangeNetwork';
export const ChangeBtcPaymentAddressTypeKey = 'ChangeBtcPaymentAddressTypeKey';
export const ChangeHasActivatedOrdinalsKey = 'ChangeHasActivatedOrdinalsKey';
export const RareSatsNoticeDismissedKey = 'RareSatsNoticeDismissedKey';
export const ChangeHasActivatedRareSatsKey = 'ChangeHasActivatedRareSatsKey';
export const ChangeHasActivatedRBFKey = 'ChangeHasActivatedRBFKey';
export const ChangeShowDataCollectionAlertKey = 'ChangeShowDataCollectionAlertKey';
export const UpdateLedgerAccountsKey = 'UpdateLedgerAccountsKey';
export const UpdateKeystoneAccountsKey = 'UpdateKeystoneAccountsKey';
export const SetSip10ManageTokensKey = 'SetSip10ManageTokensKey';
export const SetBrc20ManageTokensKey = 'SetBrc20ManageTokensKey';
export const SetRunesManageTokensKey = 'SetRunesManageTokens';
export const SetNotificationBannersKey = 'SetNotificationBanners';
export const SetWalletLockPeriodKey = 'SetWalletLockPeriod';
export const SetWalletUnlockedKey = 'SetWalletUnlocked';
export const SetWalletHideStxKey = 'SetWalletHideStx';
export const SetSpamTokenKey = 'SetSpamTokenKey';
export const SetSpamTokensKey = 'SetSpamTokensKey';
export const SetShowSpamTokensKey = 'SetShowSpamTokensKey';
export const AddToStarCollectiblesKey = 'AddToStarCollectiblesKey';
export const RemoveFromStarCollectiblesKey = 'RemoveFromStarCollectiblesKey';
export const AddToHideCollectiblesKey = 'AddToHideCollectiblesKey';
export const SetHiddenCollectiblesKey = 'SetHiddenCollectiblesKey';
export const RemoveFromHideCollectiblesKey = 'RemoveFromHideCollectiblesKey';
export const RemoveAllFromHideCollectiblesKey = 'RemoveAllFromHideCollectiblesKey';
export const SetAccountAvatarKey = 'SetAccountAvatarKey';
export const RemoveAccountAvatarKey = 'RemoveAccountAvatarKey';
export const SetBalanceHiddenToggleKey = 'SetBalanceHiddenToggleKey';
export const SetShowBalanceInBtcToggleKey = 'SetShowBalanceInBtcToggleKey';
export const SetWalletBackupStatusKey = 'SetWalletBackupStatusKey';
export const SetAddingAccountKey = 'SetAddingAccountKey';

export enum WalletSessionPeriods {
  LOW = 15,
  STANDARD = 30,
  LONG = 60,
  VERY_LONG = 180,
}

export type SoftwareWallet = {
  walletId: WalletId;
  derivationType: DerivationType;
  accounts: Account[];
};

export type SoftwareWallets = {
  [network in NetworkType]: SoftwareWallet[];
};

export interface WalletState {
  softwareWallets: SoftwareWallets;
  ledgerAccountsList: Account[];
  keystoneAccountsList: Account[];
  selectedAccountIndex: number;
  selectedAccountType: AccountType;
  selectedWalletId?: WalletId;
  btcPaymentAddressType: BtcPaymentType;
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
  showDataCollectionAlert: boolean | null;
  walletLockPeriod: WalletSessionPeriods;
  isUnlocked: boolean;
  hideStx: boolean;
  showSpamTokens: boolean;
  spamToken: FungibleToken | null;
  spamTokens: string[];
  hiddenCollectibleIds: Record<string, Record<string, string>>;
  starredCollectibleIds: Record<string, Array<{ id: string; collectionId: string }>>;
  avatarIds: Record<string, AvatarInfo>;
  balanceHidden: boolean;
  showBalanceInBtc: boolean;
  hasBackedUpWallet: boolean;
  addingAccount?: boolean;

  // TODO: remove in future migration once we use persistent store manager fully
  accountBalances: {
    [key: string]: string;
  };
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

export interface UpdateSoftwareWallets {
  type: typeof UpdateSoftwareWalletsKey;
  network: NetworkType;
  softwareWallets: SoftwareWallet[];
}
export interface UpdateLedgerAccounts {
  type: typeof UpdateLedgerAccountsKey;
  ledgerAccountsList: Account[];
}
export interface SelectAccount {
  type: typeof SelectAccountKey;
  selectedAccountIndex: number;
  selectedAccountType: AccountType;
  selectedWalletId?: WalletId;
}
export interface UpdateKeystoneAccounts {
  type: typeof UpdateKeystoneAccountsKey;
  keystoneAccountsList: Account[];
}

export interface ChangeFiatCurrency {
  type: typeof ChangeFiatCurrencyKey;
  fiatCurrency: SupportedCurrency;
}
export interface ChangeNetwork {
  type: typeof ChangeNetworkKey;
  network: SettingsNetwork;
}

export interface ChangeBtcPaymentAddressType {
  type: typeof ChangeBtcPaymentAddressTypeKey;
  btcPaymentType: BtcPaymentType;
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

export interface SetWalletHideStx {
  type: typeof SetWalletHideStxKey;
  hideStx: boolean;
}

export interface SetSpamToken {
  type: typeof SetSpamTokenKey;
  spamToken: FungibleToken | null;
}

export interface SetSpamTokens {
  type: typeof SetSpamTokensKey;
  spamTokens: string[];
}

export interface SetShowSpamTokens {
  type: typeof SetShowSpamTokensKey;
  showSpamTokens: boolean;
}

export interface AddToStarCollectibles {
  type: typeof AddToStarCollectiblesKey;
  address: string;
  id: string;
  collectionId?: string;
}

export interface RemoveFromStarCollectibles {
  type: typeof RemoveFromStarCollectiblesKey;
  address: string;
  id: string;
}

export interface AddToHideCollectibles {
  type: typeof AddToHideCollectiblesKey;
  address: string;
  id: string;
  collectionId?: string;
}

export interface RemoveFromHideCollectibles {
  type: typeof RemoveFromHideCollectiblesKey;
  address: string;
  id: string;
}

export interface RemoveAllFromHideCollectibles {
  type: typeof RemoveAllFromHideCollectiblesKey;
  address: string;
}

export interface SetHiddenCollectibles {
  type: typeof SetHiddenCollectiblesKey;
  collectibleIds: Record<string, Record<string, string>>;
}

export interface SetAccountAvatar {
  type: typeof SetAccountAvatarKey;
  address: string;
  avatar: AvatarInfo;
}

export interface RemoveAccountAvatar {
  type: typeof RemoveAccountAvatarKey;
  address: string;
}

export type AvatarInfo =
  | {
      type: 'inscription';
      inscription: Inscription;
    }
  | {
      type: 'stacks';
      nft: NftData;
    };

export interface SetBalanceHiddenToggle {
  type: typeof SetBalanceHiddenToggleKey;
  toggle: boolean;
}

export interface SetShowBalanceInBtc {
  type: typeof SetShowBalanceInBtcToggleKey;
  toggle: boolean;
}

export interface SetWalletBackupStatus {
  type: typeof SetWalletBackupStatusKey;
  hasBackedUpWallet: boolean;
}

export interface SetAddingAccount {
  type: typeof SetAddingAccountKey;
  addingAccount: boolean;
}

export type WalletActions =
  | ResetWallet
  | UpdateSoftwareWallets
  | UpdateLedgerAccounts
  | UpdateKeystoneAccounts
  | SelectAccount
  | StoreEncryptedSeed
  | SetFeeMultiplier
  | ChangeFiatCurrency
  | ChangeNetwork
  | ChangeBtcPaymentAddressType
  | ChangeActivateOrdinals
  | ChangeActivateRareSats
  | ChangeActivateRBF
  | ChangeShowDataCollectionAlert
  | SetSip10ManageTokens
  | SetBrc20ManageTokens
  | SetRunesManageTokens
  | SetNotificationBanners
  | SetWalletLockPeriod
  | SetRareSatsNoticeDismissed
  | SetWalletUnlocked
  | SetWalletHideStx
  | SetSpamToken
  | SetSpamTokens
  | SetShowSpamTokens
  | AddToStarCollectibles
  | RemoveFromStarCollectibles
  | AddToHideCollectibles
  | RemoveFromHideCollectibles
  | RemoveAllFromHideCollectibles
  | SetHiddenCollectibles
  | SetAccountAvatar
  | RemoveAccountAvatar
  | SetBalanceHiddenToggle
  | SetShowBalanceInBtc
  | SetWalletBackupStatus
  | SetAddingAccount;
