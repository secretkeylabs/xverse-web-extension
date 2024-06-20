import { WebBtcMessage } from '@common/types/message-types';
import { RpcErrorCode, RpcRequestMessage } from '@sats-connect/core';
import { getTabIdFromPort } from '..';
import {
  handleGetAccounts,
  handleGetAddresses,
  handleSendTransfer,
  handleSignMessage,
  handleSignPsbt,
} from './btc';
import handleGetInfo from './getInfo';
import { makeRPCError, sendRpcResponse } from './helpers';
import handleGetRunesBalance from './runes/getBalance';
import callContract from './stx/callContract/index.ts';
import deployContract from './stx/deployContract/index.ts';
import handleGetStxAccounts from './stx/getAccounts';
import handleGetStxAddresses from './stx/getAddresses';
import handleStacksSignMessage from './stx/signMessage';
import handleStacksSignStructuredMessage from './stx/signStructuredMessage';
import signTransaction from './stx/signTransaction';
import transferStx from './stx/transferStx';

export async function handleRPCRequest(message: RpcRequestMessage, port: chrome.runtime.Port) {
  try {
    switch (message.method) {
      case 'getInfo': {
        handleGetInfo(message.id as string, getTabIdFromPort(port));
        break;
      }
      case 'getAddresses': {
        await handleGetAddresses(message as unknown as WebBtcMessage<'getAddresses'>, port);
        break;
      }
      case 'getAccounts': {
        await handleGetAccounts(message as unknown as WebBtcMessage<'getAccounts'>, port);
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
      case 'stx_signTransaction': {
        await signTransaction(message as unknown as WebBtcMessage<'stx_signTransaction'>, port);
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
        await handleGetRunesBalance(message.id as string, getTabIdFromPort(port));
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
