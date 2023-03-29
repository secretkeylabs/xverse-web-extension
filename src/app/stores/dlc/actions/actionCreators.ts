/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as actions from './types';
import { AnyContract } from 'dlc-lib';
import { Network } from 'bitcoinjs-lib/src/networks';
import { NetworkType } from '@secretkeylabs/xverse-core';

export function handleContractRequest() {
  return {
    type: actions.ContractRequestKey,
  };
}

export function contractSuccess(contracts: AnyContract[]) {
  return {
    type: actions.ContractSuccessKey,
    contracts,
  };
}

export function contractError(error: string) {
  return {
    type: actions.ContractErrorKey,
    error,
  };
}

export function offerRequest(offerMessage: string) {
  return {
    type: actions.OfferRequestKey,
    offerMessage,
  };
}

export function acceptRequest(
  contractId: string,
  btcAddress: string,
  btcPublicKey: string,
  btcPrivateKey: string,
  network: NetworkType
) {
  console.log(btcAddress)
  console.log(btcPrivateKey)
  console.log(btcPublicKey)
  return {
    type: actions.AcceptRequestKey,
    contractId,
    btcAddress,
    btcPublicKey,
    btcPrivateKey,
    network,
  };
}

export function signRequest(
  contractId: string,
  btcPrivateKey: string,
  btcNetwork: NetworkType,
  counterpartyWalletURL: string
) {
  console.log(counterpartyWalletURL)
  return {
    type: actions.SignRequestKey,
    contractId,
    btcPrivateKey,
    btcNetwork,
    counterpartyWalletURL,
  };
}

export function rejectRequest(contractId: string) {
  return {
    type: actions.RejectRequestKey,
    contractId,
  };
}

export function actionSuccess(contract: AnyContract) {
  return {
    type: actions.ActionSuccessKey,
    contract,
  };
}

export function actionError(error: { error: string; contract?: AnyContract; contractID?: string }) {
  return {
    type: actions.ActionErrorKey,
    error,
  };
}

export function select(contract: AnyContract) {
  return {
    type: actions.SelectKey,
    contract,
  };
}

export function update(contract: AnyContract) {
  return {
    type: actions.UpdateKey,
    contract,
  };
}
