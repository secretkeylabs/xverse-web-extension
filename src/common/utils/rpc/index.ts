import { WebBtcMessage } from '@common/types/message-types';
import { Requests, RpcErrorCode } from 'sats-connect';
import { getTabIdFromPort } from '..';
import { handleGetAddresses, handleSendTransfer, handleSignMessage, handleSignPsbt } from './btc';
import handleGetInfo from './getInfo';
import { makeRPCError, sendRpcResponse } from './helpers';
import callContract from './stx/callContract/index.ts';
import handleGetStxAccounts from './stx/getAccounts';
import handleGetStxAddresses from './stx/getAddresses';
import handleStacksSignMessage from './stx/signMessage';
import handleStacksSignStructuredMessage from './stx/signStructuredMessage';
import signTransaction from './stx/signTransaction';
import transferStx from './stx/transferStx';

const handleRPCRequest = async (
  message: WebBtcMessage<keyof Requests>,
  port: chrome.runtime.Port,
) => {
  try {
    switch (message.method) {
      case 'getInfo':
        handleGetInfo(message.id, getTabIdFromPort(port));
        break;
      case 'getAddresses':
        await handleGetAddresses(message as WebBtcMessage<'getAddresses'>, port);
        break;
      case 'signMessage':
        await handleSignMessage(message as WebBtcMessage<'signMessage'>, port);
        break;
      case 'sendTransfer':
        await handleSendTransfer(message as WebBtcMessage<'sendTransfer'>, port);
        break;
      case 'signPsbt':
        await handleSignPsbt(message as WebBtcMessage<'signPsbt'>, port);
        break;

      // Stacks methods

      case 'stx_callContract': {
        await callContract(message as WebBtcMessage<'stx_callContract'>, port);
        break;
      }
      case 'stx_getAccounts': {
        await handleGetStxAccounts(message as WebBtcMessage<'stx_getAccounts'>, port);
        break;
      }
      case 'stx_getAddresses': {
        await handleGetStxAddresses(message as WebBtcMessage<'stx_getAddresses'>, port);
        break;
      }
      case 'stx_signTransaction': {
        await signTransaction(message as WebBtcMessage<'stx_signTransaction'>, port);
        break;
      }
      case 'stx_transferStx': {
        await transferStx(message as WebBtcMessage<'stx_transferStx'>, port);
        break;
      }
      case 'stx_signMessage': {
        await handleStacksSignMessage(message as WebBtcMessage<'stx_signMessage'>, port);
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
    sendRpcResponse(
      getTabIdFromPort(port),
      makeRPCError(message.id as string, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: e.message,
      }),
    );
  }
};

export default handleRPCRequest;
