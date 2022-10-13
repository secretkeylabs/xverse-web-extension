import { NetworkType, SettingsNetwork, StxTransactionData } from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';

export const SetWalletKey = 'SetWallet';
export const ResetWalletKey = 'ResetWallet';
export const FetchAccountKey = 'FetchAccount';
export const SelectAccountKey = 'SelectAccount';
export const UnlockWalletKey = 'UnlockWallet';
export const LockWalletKey = 'LockWallet';
export const StoreEncryptedSeedKey = 'StoreEncryptedSeed';

export const AddAccountRequestKey = 'AddAccountRequest';
export const AddAccountSuccessKey = 'AddAccountSuccess';
export const AddAccountFailureKey = 'AddAccountFailure';

export const FetchWalletDataRequestKey = 'FetchWalletDataRequest';
export const FetchWalletDataSuccessKey = 'FetchWalletDataSuccess';
export const FetchWalletDataFailureKey = 'FetchWalletDataFailure';

export interface Account {
  id: number;
  stxAddress: string;
  btcAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  bnsName?: string;
}

export interface WalletState {
  stxAddress: string;
  btcAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  accountsList: Account[];
  selectedAccount: Account | null;
  network: NetworkType;
  seedPhrase: string;
  encryptedSeed: string;
  loadingWalletData:boolean;
  fiatCurrency: string;
}

export interface WalletData {
  stxAddress: string;
  btcAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  seedPhrase: string;
}

export interface SetWallet {
  type: typeof SetWalletKey;
  wallet: WalletData;
}

export interface StoreEncryptedSeed {
  type: typeof StoreEncryptedSeedKey,
  encryptedSeed: string,
}

export interface UnlockWallet {
  type: typeof UnlockWalletKey,
  seed: string,
}

export interface LockWallet {
  type: typeof LockWalletKey,
}
export interface ResetWallet {
  type: typeof ResetWalletKey;
}

export interface FetchAccount {
  type: typeof FetchAccountKey;
  selectedAccount: Account | null;
  accountsList: Account[];
}

export interface AddAccountRequest {
  type: typeof AddAccountRequestKey;
  seed: string;
  network: NetworkType,
  accountsList: Account[];
}

export interface AddAccountSuccess{
  type: typeof AddAccountSuccessKey;
  accountsList: Account[];
}

export interface AddAccountFailure {
  type: typeof AddAccountFailureKey;
  error: string;
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
  network: NetworkType;
  //stackingState: StackingStateData;
}

export interface FetchWalletDataRequest {
  type: typeof FetchWalletDataRequestKey;
  stxAddress: string;
  btcAddress: string;
  network: NetworkType;
  fiatCurrency: string;
}

export interface FetchWalletDataSuccess {
  type: typeof FetchWalletDataSuccessKey;
  totalBalance: BigNumber;
  stxBalance: BigNumber;
  stxAvailableBalance: BigNumber;
  stxLockedBalance: BigNumber;
  btcBalance: BigNumber;
  stxTransactions: StxTransactionData[];
  stxNonce: number;
  totalTransactions: number;
  selectedNetwork: SettingsNetwork;
}

export interface FetchWalletDataFail {
  type: typeof FetchWalletDataFailureKey;
}

export type WalletActions = SetWallet | ResetWallet | FetchAccount |AddAccountRequest | AddAccountSuccess | AddAccountFailure| SelectAccount| StoreEncryptedSeed | UnlockWallet | LockWallet |FetchWalletDataRequest|FetchWalletDataSuccess |FetchWalletDataFail ;

