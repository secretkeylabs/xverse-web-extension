import { NetworkType } from '@secretkeylabs/xverse-core/types';

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

export interface AddAccountRequestAction {
  type: typeof AddAccountRequestKey;
  seed: string;
  network: NetworkType
}

export interface AddAccountSuccessAction {
  type: typeof AddAccountSuccessKey;
  accountsList: Account[];
}

export interface AddAccountFailureAction {
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

export type WalletActions = SetWallet | ResetWallet | FetchAccount |AddAccountRequestAction | AddAccountSuccessAction | AddAccountFailureAction| SelectAccount| StoreEncryptedSeed | UnlockWallet | LockWallet;

