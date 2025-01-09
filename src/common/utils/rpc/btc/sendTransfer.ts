/* eslint-disable import/prefer-default-export */
import { RpcErrorCode, type SendTransferRequestMessage } from '@sats-connect/core';
import {
  listenForOriginTabClose,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
  type ParamsKeyValueArray,
} from '../../legacy-external-message-handler';
import RequestsRoutes from '../../route-urls';
import { makeRPCError } from '../helpers';

export const handleSendTransfer = async (
  message: SendTransferRequestMessage,
  port: chrome.runtime.Port,
) => {
  const requestParams: ParamsKeyValueArray = [
    ['recipients', JSON.stringify(message.params.recipients)],
    ['requestId', message.id as string],
  ];

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, requestParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.SendBtcTx, urlParams);
  listenForPopupClose({
    tabId,
    id,
    response: makeRPCError(message.id, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'User rejected request to send transfer',
    }),
  });
  listenForOriginTabClose({ tabId });
};
