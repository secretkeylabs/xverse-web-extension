/* eslint-disable import/prefer-default-export */
import type { WebBtcMessage } from '@common/types/message-types';
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
import { makeRPCError } from '../helpers';

const SignPsbtSchema = z.object({
  psbt: z.string(),
  signInputs: z.record(z.array(z.number())), // Record<string, number[]>
  broadcast: z.boolean().optional(),
  allowedSignHash: z.number().optional(),
});

export const handleSignPsbt = async (
  message: WebBtcMessage<'signPsbt'>,
  port: chrome.runtime.Port,
) => {
  const paramsParseResult = SignPsbtSchema.safeParse(message.params);
  if (!paramsParseResult.success) {
    const invalidParamsError = makeRPCError(message.id, {
      code: RpcErrorCode.INVALID_PARAMS,
      message: 'Invalid params',
    });
    port.postMessage(invalidParamsError);
    return;
  }

  const requestParams: ParamsKeyValueArray = [
    ['requestId', message.id as string],
    ['signInputs', JSON.stringify(paramsParseResult.data.signInputs)],
    ['psbt', paramsParseResult.data.psbt],
  ];

  if (message.params.broadcast) requestParams.push(['broadcast', String(message.params.broadcast)]);
  if (message.params.allowedSignHash)
    requestParams.push(['allowedSigHash', message.params.allowedSignHash.toString()]);

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, requestParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.SignBtcTx, urlParams);
  listenForPopupClose({
    tabId,
    id,
    response: makeRPCError(message.id, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'User rejected request to sign a psbt',
    }),
  });

  listenForOriginTabClose({ tabId });
};
