import { StacksTransaction } from '@stacks/transactions';

interface TLegacyReturn {
  payload: any;
  transaction?: StacksTransaction;
  tabId: number;
  requestToken: string;
}

interface Metadata {
  messageId: string;
}

export interface TReturnSignTransaction extends TLegacyReturn, Metadata {
  rpcMethod: 'stx_signTransaction';
}

export interface TReturnCallContract extends TLegacyReturn, Metadata {
  rpcMethod: 'stx_callContract';
}

export interface TReturnTransferStx extends TLegacyReturn, Metadata {
  rpcMethod: 'stx_transferStx';
}

export interface TReturnDeployContract extends TLegacyReturn, Metadata {
  rpcMethod: 'stx_deployContract';
}

export type Return =
  | TReturnSignTransaction
  | TReturnCallContract
  | TReturnTransferStx
  | TReturnDeployContract
  | TLegacyReturn;
