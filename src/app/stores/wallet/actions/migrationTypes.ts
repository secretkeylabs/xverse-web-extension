import type {
  AccountType,
  AppInfo,
  BtcPaymentType,
  Coin,
  DerivationType,
  FungibleToken,
  NetworkType,
  SettingsNetwork,
  SupportedCurrency,
  WalletId,
} from '@secretkeylabs/xverse-core';
import type { AvatarInfo, WalletSessionPeriods } from './types';

/**
 * Initial wallet state (V1)
 */
type SettingsNetworkV1 = {
  type: NetworkType;
  address: string;
  btcApiUrl: string;
};

export type AccountV1 = {
  id: number;
  stxAddress: string;
  btcAddress: string;
  ordinalsAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  ordinalsPublicKey: string;
  bnsName?: string;
  accountType?: AccountType;
  accountName?: string;
  deviceAccountIndex?: number;
};

export type WalletStateV1 = {
  stxAddress: string;
  btcAddress: string;
  ordinalsAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  ordinalsPublicKey: string;
  accountsList: AccountV1[];
  ledgerAccountsList: AccountV1[];
  selectedAccount: AccountV1 | null;
  network: SettingsNetworkV1;
  savedNetworks: SettingsNetwork[];
  encryptedSeed: string;
  fiatCurrency: SupportedCurrency;
  coinsList: FungibleToken[] | null;
  coins: Coin[];
  brcCoinsList: FungibleToken[] | null;
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
  showSpamTokens: boolean;
  spamToken: FungibleToken | null;
  spamTokens: string[];
  savedNames: {
    [key in NetworkType]?: { id: number; name?: string }[];
  };
};

/**
 * =========V2=========
 */
type SettingsNetworkV2 = {
  type: NetworkType;
  address: string;
  btcApiUrl: string;
  fallbackBtcApiUrl: string;
};
export type WalletStateV2 = Omit<WalletStateV1, 'network'> & { network: SettingsNetworkV2 };

/**
 * =========V3=========
 */
export type WalletStateV3 = Omit<WalletStateV2, 'coinsList' | 'coins' | 'brcCoinsList'> & {
  sip10ManageTokens: Record<string, boolean>;
  brc20ManageTokens: Record<string, boolean>;
  runesManageTokens: Record<string, boolean>;
};

/**
 * =========V4=========
 */
export type WalletStateV4 = Omit<
  WalletStateV3,
  | 'selectedAccount'
  | 'stxAddress'
  | 'btcAddress'
  | 'ordinalsAddress'
  | 'masterPubKey'
  | 'stxPublicKey'
  | 'btcPublicKey'
  | 'ordinalsPublicKey'
  | 'bnsName'
  | 'accountType'
  | 'accountName'
> & {
  selectedAccountIndex: number;
  selectedAccountType: AccountType;
};

/**
 * =========V5=========
 */
type BtcAddressV5 = {
  address: string;
  publicKey: string;
};
export type AccountBtcAddressesV5 = {
  nested?: BtcAddressV5;
  native?: BtcAddressV5;
  taproot: BtcAddressV5;
};
export type AccountV5 = {
  id: number;
  deviceAccountIndex?: number;
  masterPubKey: string;
  accountType: AccountType;
  accountName?: string;
  stxAddress: string;
  stxPublicKey: string;
  bnsName?: string;
  btcAddresses: AccountBtcAddressesV5;
};

export type WalletStateV5 = Omit<
  WalletStateV4,
  | 'btcAddress'
  | 'btcPublicKey'
  | 'ordinalsAddress'
  | 'ordinalsPublicKey'
  | 'accountsList'
  | 'ledgerAccountsList'
> & {
  allowNestedSegWitAddress: boolean;
  accountsList: AccountV5[];
  ledgerAccountsList: AccountV5[];
  btcPaymentAddressType: BtcPaymentType;

  hiddenCollectibleIds: Record<string, Record<string, string>>;
  starredCollectibleIds: Record<string, Array<{ id: string; collectionId: string }>>;
  avatarIds: Record<string, AvatarInfo>;
  balanceHidden: boolean;
};

export type WalletStateV6 = Omit<WalletStateV5, 'allowNestedSegWitAddress'>;

export type WalletStateV7 = WalletStateV6 & {
  showBalanceInBtc: boolean;
  hasBackedUpWallet: boolean;
};

export type WalletStateV8 = WalletStateV7; // no changes. just a data migration

export type WalletStateV9 = Omit<
  WalletStateV8,
  'showBtcReceiveAlert' | 'showOrdinalReceiveAlert'
> & {
  keystoneAccountsList: AccountV5[];
};

/**
 * =========V10=========
 */
export type AccountV10 = AccountV5 &
  (
    | {
        accountType: 'software';
        walletId: WalletId;
      }
    | {
        accountType: Exclude<AccountType, 'software'>;
        walletId: never;
      }
  );

export type SoftwareWalletV10 = {
  walletId: WalletId;
  derivationType: DerivationType;
  accounts: AccountV10[];
};

type NetworkTypeV10 = 'Mainnet' | 'Testnet' | 'Testnet4' | 'Signet' | 'Regtest';

// should be exported and used when we add next migration
type WalletStateV10 = Omit<WalletStateV9, 'accountsList' | 'savedNames'> & {
  softwareWallets: {
    [network in NetworkTypeV10]: SoftwareWalletV10[];
  };
};
