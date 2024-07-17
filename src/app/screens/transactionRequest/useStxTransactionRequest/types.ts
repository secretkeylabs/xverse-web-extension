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

interface TReturnSignTransaction extends TLegacyReturn, Metadata {
  rpcMethod: 'stx_signTransaction';
}

interface TReturnCallContract extends TLegacyReturn, Metadata {
  rpcMethod: 'stx_callContract';
}

interface TReturnTransferStx extends TLegacyReturn, Metadata {
  rpcMethod: 'stx_transferStx';
}

interface TReturnDeployContract extends TLegacyReturn, Metadata {
  rpcMethod: 'stx_deployContract';
}

export type Return =
  | TReturnSignTransaction
  | TReturnCallContract
  | TReturnTransferStx
  | TReturnDeployContract
  | TLegacyReturn;
