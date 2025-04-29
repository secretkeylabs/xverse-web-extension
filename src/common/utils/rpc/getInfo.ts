import { type GetInfoRequestMessage, type Requests, type Return } from '@sats-connect/core';
import { getTabIdFromPort } from '..';
import { makeRpcSuccessResponse, sendRpcResponse } from './helpers';

declare const VERSION: string;

const methodsObj: { [K in keyof Requests]: null } = {
  getAccounts: null,
  getAddresses: null,
  getBalance: null,
  getInfo: null,
  ord_getInscriptions: null,
  ord_sendInscriptions: null,
  runes_estimateEtch: null,
  runes_estimateMint: null,
  runes_estimateRbfOrder: null,
  runes_etch: null,
  runes_getBalance: null,
  runes_getOrder: null,
  runes_mint: null,
  runes_rbfOrder: null,
  runes_transfer: null,
  sendTransfer: null,
  signMessage: null,
  signPsbt: null,
  stx_callContract: null,
  stx_deployContract: null,
  stx_getAccounts: null,
  stx_getAddresses: null,
  stx_signMessage: null,
  stx_signStructuredMessage: null,
  stx_signTransaction: null,
  stx_signTransactions: null,
  stx_transferStx: null,
  wallet_changeNetwork: null,
  wallet_connect: null,
  wallet_disconnect: null,
  wallet_getAccount: null,
  wallet_getCurrentPermissions: null,
  wallet_getNetwork: null,
  wallet_getWalletType: null,
  wallet_renouncePermissions: null,
  wallet_requestPermissions: null,
};

async function handleGetInfo(message: GetInfoRequestMessage, port: chrome.runtime.Port) {
  const response: Return<'getInfo'> = {
    version: VERSION,

    // TODO: migrate when all methods have been migrated. See
    // https://linear.app/xverseapp/issue/ENG-4623
    methods: Object.keys(methodsObj),
    supports: [],
  };
  sendRpcResponse(getTabIdFromPort(port), makeRpcSuccessResponse(message.id, response));
}

export default handleGetInfo;
