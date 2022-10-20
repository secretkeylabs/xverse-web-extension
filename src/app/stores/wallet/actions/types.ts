import { NetworkType } from '@secretkeylabs/xverse-core/types';

export const SetWalletKey = 'SetWallet';
export const ResetWalletKey = 'ResetWallet';
export const UnlockWalletKey = 'UnlockWallet';
export const LockWalletKey = 'LockWallet';
export const StoreEncryptedSeedKey = 'StoreEncryptedSeed';

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

export type WalletActions = SetWallet | ResetWallet | StoreEncryptedSeed | UnlockWallet | LockWallet;
