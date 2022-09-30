import { Network } from 'app/core/types/networks';
import { Account } from 'app/core/types/accounts';

export const GenerateWalletKey = 'GenerateWallet';
export const GenerateWalletSuccessKey = 'GenerateWalletSuccess';

export interface GenerateWalletAction {
  type: typeof GenerateWalletKey;
}

export interface GenerateWalletSuccess {
  type: typeof GenerateWalletSuccessKey;
  stxAddress: string;
  btcAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  network: Network;
  accountsList: Account[];
  bnsName?: string;
}

export type WalletActions =
  | GenerateWalletAction
  | GenerateWalletSuccess;
