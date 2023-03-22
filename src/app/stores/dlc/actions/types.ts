import { AnyContract } from 'dlc-lib';
import { Network } from 'bitcoinjs-lib/src/networks';
import { NetworkType } from '@secretkeylabs/xverse-core';

export const ContractRequestKey = 'ContractRequest';
export const ContractSuccessKey = 'ContractSuccess';
export const ContractErrorKey = 'ContractError';
export const OfferRequestKey = 'OfferRequest';
export const AcceptRequestKey = 'AcceptRequest';
export const SignRequestKey = 'SignRequest';
export const RejectRequestKey = 'RejectRequest';
export const ActionSuccessKey = 'ActionSuccess';
export const ActionErrorKey = 'ActionError';
export const SelectKey = 'Select';
export const UpdateKey = 'Update';

export interface DlcState {
  readonly contracts: AnyContract[];
  readonly actionSuccess: boolean;
  readonly processing: boolean;
  readonly error?: string;
  readonly currentId?: string;
  readonly acceptMsg?: string;
  readonly selectedContract?: AnyContract;
  readonly signingRequested: boolean;
  readonly acceptMessageSubmitted: boolean;
}

export interface ContractRequest {
  type: typeof ContractRequestKey;
}

export interface ContractSuccess {
  type: typeof ContractSuccessKey;
  contracts: AnyContract[];
}

export interface ContractError {
  type: typeof ContractErrorKey;
  error: string;
}

export interface OfferRequest {
  type: typeof OfferRequestKey;
  offerMessage: string;
}

export interface AcceptRequest {
  type: typeof AcceptRequestKey;
  contractId: string;
  btcAddress: string;
  btcPublicKey: string;
  btcPrivateKey: string;
  network: Network;
}

export interface SignRequest {
  type: typeof SignRequestKey;
  contractId: string;
  btcPrivateKey: string;
  btcNetwork: NetworkType;
  counterpartyWalletURL: string;
}

export interface RejectRequest {
  type: typeof RejectRequestKey;
  contractId: string;
}

export interface ActionSuccess {
  type: typeof ActionSuccessKey;
  contract: AnyContract;
}

export interface ActionError {
  type: typeof ActionErrorKey;
  error: {
    error: string;
    contract?: AnyContract;
    contractID?: string;
  };
}

export interface Select {
  type: typeof SelectKey;
  contract: AnyContract;
}

export interface Update {
  type: typeof UpdateKey;
  contract: AnyContract;
}

export type DlcActions =
  | ContractRequest
  | ContractSuccess
  | ContractError
  | OfferRequest
  | AcceptRequest
  | SignRequest
  | RejectRequest
  | ActionSuccess
  | ActionError
  | Select
  | Update;
