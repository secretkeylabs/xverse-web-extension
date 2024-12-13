import { StacksTransactionWire } from '@stacks/transactions';

interface Broadcast {
  broadcast: boolean;
}

interface TLegacyReturn extends Broadcast {
  payload: any;
  transaction?: StacksTransactionWire;
  tabId: number;
  requestToken: string;
}

interface Metadata {
  messageId: string;
}

interface TReturnSignTransaction extends TLegacyReturn, Metadata, Broadcast {
  rpcMethod: 'stx_signTransaction';
}

interface TReturnCallContract extends TLegacyReturn, Metadata, Broadcast {
  rpcMethod: 'stx_callContract';
}

interface TReturnTransferStx extends TLegacyReturn, Metadata, Broadcast {
  rpcMethod: 'stx_transferStx';
}

interface TReturnDeployContract extends TLegacyReturn, Metadata, Broadcast {
  rpcMethod: 'stx_deployContract';
}

export type Return =
  | TReturnSignTransaction
  | TReturnCallContract
  | TReturnTransferStx
  | TReturnDeployContract
  | TLegacyReturn;
