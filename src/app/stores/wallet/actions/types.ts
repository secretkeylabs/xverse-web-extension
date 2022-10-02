export const SetWalletKey = 'SetWallet';
export const ResetWalletKey = 'ResetWallet';

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

export interface ResetWallet {
  type: typeof ResetWalletKey;
}

export type WalletActions = SetWallet | ResetWallet;
