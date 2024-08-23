/* eslint-disable import/prefer-default-export */
import type { WebBtcMessage } from '@common/types/message-types';
import { getTabIdFromPort } from '@common/utils';
import { RpcErrorCode } from '@sats-connect/core';
import { z } from 'zod';
import {
  listenForOriginTabClose,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
  type ParamsKeyValueArray,
} from '../../legacy-external-message-handler';
import RequestsRoutes from '../../route-urls';
import { makeRPCError, sendRpcResponse } from '../helpers';

const TransferRecipientSchema = z.object({
  address: z.string(),
  amount: z.number(),
});

const SendTransferParamsSchema = z.object({
  recipients: z.array(TransferRecipientSchema),
});

export const handleSendTransfer = async (
  message: WebBtcMessage<'sendTransfer'>,
  port: chrome.runtime.Port,
) => {
  const paramsParseResult = SendTransferParamsSchema.safeParse(message.params);

  if (!paramsParseResult.success) {
    const invalidParamsError = makeRPCError(message.id, {
      code: RpcErrorCode.INVALID_PARAMS,
      message: 'Invalid params',
    });
    sendRpcResponse(getTabIdFromPort(port), invalidParamsError);
    return;
  }
  const requestParams: ParamsKeyValueArray = [
    ['recipients', JSON.stringify(paramsParseResult.data.recipients)],
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
