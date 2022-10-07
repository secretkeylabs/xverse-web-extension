import { Account } from "@core/types/accounts";
import { Network } from "@core/types/networks";

export const SetWalletKey = 'SetWallet';
export const ResetWalletKey = 'ResetWallet';
export const FetchAccountKey = 'FetchAccount';
export const SelectAccountKey = 'SelectAccount';

export const AddAccountRequestKey = 'AddAccountRequest';
export const AddAccountSuccessKey = 'AddAccountSuccess';
export const AddAccountFailureKey = 'AddAccountFailure';

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

export interface FetchAccount {
  type: typeof FetchAccountKey;
  selectedAccount: Account | null;
  accountsList: Account[];
}

export interface AddAccountRequestAction {
  type: typeof AddAccountRequestKey;
  seed: string;
  network: Network
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
  network: Network;
  //stackingState: StackingStateData;
}

export type WalletActions = SetWallet | ResetWallet | FetchAccount |AddAccountRequestAction | AddAccountSuccessAction | AddAccountFailureAction| SelectAccount;
