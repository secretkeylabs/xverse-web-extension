import { type WebBtcMessage } from '@common/types/message-types';
import {
  getAccountsMethodName,
  getAddressesMethodName,
  getBalanceMethodName,
  getInfoMethodName,
  getWalletTypeMethodName,
  renouncePermissionsMethodName,
  requestPermissionsMethodName,
  RpcErrorCode,
  sendInscriptionsMethodName,
  stxSignTransactionMethodName,
  type RpcRequestMessage,
} from '@sats-connect/core';
import { getTabIdFromPort } from '..';
import {
  handleGetAccounts,
  handleGetAddresses,
  handleSendTransfer,
  handleSignMessage,
  handleSignPsbt,
} from './btc';
import handleGetBalance from './btc/getBalance';
import handleGetInfo from './getInfo';
import { makeRPCError, sendRpcResponse } from './helpers';
import handleGetInscriptions from './ordinals/getInscriptions';
import handleSendInscriptions from './ordinals/sendInscriptions';
import handleEtchRune from './runes/etch';
import handleGetRunesBalance from './runes/getBalance';
import handleMintRune from './runes/mint';
import handleTransferRunes from './runes/transfer';
import callContract from './stx/callContract';
import deployContract from './stx/deployContract';
import handleGetStxAccounts from './stx/getAccounts';
import handleGetStxAddresses from './stx/getAddresses';
import handleStacksSignMessage from './stx/signMessage';
import handleStacksSignStructuredMessage from './stx/signStructuredMessage';
import signTransaction from './stx/signTransaction';
import transferStx from './stx/transferStx';
import { handleGetWalletType } from './wallet/getWalletType';
import { handleRenouncePermissions } from './wallet/renouncePermissions';
import { handleRequestPermissions } from './wallet/requestPermissions';

async function handleRPCRequest(message: RpcRequestMessage, port: chrome.runtime.Port) {
  try {
    switch (message.method) {
      case requestPermissionsMethodName: {
        await handleRequestPermissions(message, port);
        break;
      }
      case renouncePermissionsMethodName: {
        await handleRenouncePermissions(message, port);
        break;
      }
      case getWalletTypeMethodName: {
        await handleGetWalletType(message, port);
        break;
      }
      case getBalanceMethodName: {
        await handleGetBalance(message, port);
        break;
      }
      case getInfoMethodName: {
        handleGetInfo(message, port);
        break;
      }
      case getAddressesMethodName: {
        await handleGetAddresses(message, port);
        break;
      }
      case getAccountsMethodName: {
        await handleGetAccounts(message, port);
        break;
      }
      case 'signMessage': {
        await handleSignMessage(message as unknown as WebBtcMessage<'signMessage'>, port);
        break;
      }
      case 'sendTransfer': {
        await handleSendTransfer(message as unknown as WebBtcMessage<'sendTransfer'>, port);
        break;
      }
      case 'signPsbt': {
        await handleSignPsbt(message as unknown as WebBtcMessage<'signPsbt'>, port);
        break;
      }

      // Stacks methods

      case 'stx_callContract': {
        await callContract(message as unknown as WebBtcMessage<'stx_callContract'>, port);
        break;
      }
      case 'stx_deployContract': {
        await deployContract(message as unknown as WebBtcMessage<'stx_deployContract'>, port);
        break;
      }
      case 'stx_getAccounts': {
        await handleGetStxAccounts(message as unknown as WebBtcMessage<'stx_getAccounts'>, port);
        break;
      }
      case 'stx_getAddresses': {
        await handleGetStxAddresses(message as unknown as WebBtcMessage<'stx_getAddresses'>, port);
        break;
      }
      case stxSignTransactionMethodName: {
        await signTransaction(message, port);
        break;
      }
      case 'stx_transferStx': {
        await transferStx(message as unknown as WebBtcMessage<'stx_transferStx'>, port);
        break;
      }
      case 'stx_signMessage': {
        await handleStacksSignMessage(message as unknown as WebBtcMessage<'stx_signMessage'>, port);
        break;
      }
      case 'stx_signStructuredMessage': {
        await handleStacksSignStructuredMessage(
          message as unknown as WebBtcMessage<'stx_signStructuredMessage'>,
          port,
        );
        break;
      }
      case 'runes_getBalance': {
        await handleGetRunesBalance(message, port);
        break;
      }
      case 'ord_getInscriptions': {
        await handleGetInscriptions(message, port);
        break;
      }
      case sendInscriptionsMethodName: {
        await handleSendInscriptions(message, port);
        break;
      }
      case 'runes_mint': {
        await handleMintRune(message as unknown as WebBtcMessage<'runes_mint'>, port);
        break;
      }
      case 'runes_etch': {
        await handleEtchRune(message as unknown as WebBtcMessage<'runes_etch'>, port);
        break;
      }
      case 'runes_transfer': {
        await handleTransferRunes(message, port);
        break;
      }
      default:
        sendRpcResponse(
          getTabIdFromPort(port),
          makeRPCError(message.id as string, {
            code: RpcErrorCode.METHOD_NOT_FOUND,
            message: `"${message.method}" is not supported.`,
          }),
        );
        break;
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendRpcResponse(
      getTabIdFromPort(port),
      makeRPCError(message.id as string, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: e.message,
      }),
    );
  }
}

export default handleRPCRequest;
