import { WebBtcMessage } from '@common/types/message-types';
import { Requests, RpcErrorCode } from 'sats-connect';
import { getTabIdFromPort } from '..';
import { handleGetAddresses, handleSendTransfer, handleSignMessage, handleSignPsbt } from './btc';
import handleGetInfo from './getInfo';
import { makeRPCError, sendRpcResponse } from './helpers';

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
