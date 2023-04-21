/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AnyContract } from 'dlc-lib';
import { NetworkType } from '@secretkeylabs/xverse-core';
import * as actions from './types';

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

export function offerRequest(counterpartyWalletUrl: string) {
  return {
    type: actions.OfferRequestKey,
    counterpartyWalletUrl: counterpartyWalletUrl,
  };
}

export function acceptRequest() {
  return {
    type: actions.AcceptRequestKey,
  };
}

export function signRequest() {
  return {
    type: actions.SignRequestKey,
  };
}

export function rejectRequest() {
  return {
    type: actions.RejectRequestKey,
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
