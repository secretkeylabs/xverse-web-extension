import type { WebBtcMessage } from '@common/types/message-types';
import { getTabIdFromPort } from '@common/utils';
import { RpcErrorCode } from '@sats-connect/core';
import SuperJSON from 'superjson';
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

const EtchTermsSchema = z.object({
  amount: z.string(),
  cap: z.string(),
  heightStart: z.string().optional(),
  heightEnd: z.string().optional(),
  offsetStart: z.string().optional(),
  offsetEnd: z.string().optional(),
});

const inscriptionDetailsSchema = z.object({
  contentType: z.string(),
  contentBase64: z.string(),
});

const EtchRuneParamsSchema = z.object({
  runeName: z.string(),
  divisibility: z.number().optional(),
  symbol: z.string().optional(),
  premine: z.string().optional(),
  isMintable: z.boolean(),
  delegateInscriptionId: z.string().optional(),
  destinationAddress: z.string(),
  refundAddress: z.string(),
  feeRate: z.number(),
  appServiceFee: z.number().optional(),
  appServiceFeeAddress: z.string().optional(),
  terms: EtchTermsSchema.optional(),
  inscriptionDetails: inscriptionDetailsSchema.optional(),
});

const handleEtchRune = async (message: WebBtcMessage<'runes_etch'>, port: chrome.runtime.Port) => {
  const paramsParseResult = EtchRuneParamsSchema.safeParse(message.params);

  if (!paramsParseResult.success) {
    const invalidParamsError = makeRPCError(message.id, {
      code: RpcErrorCode.INVALID_PARAMS,
      message: 'Invalid params',
    });
    sendRpcResponse(getTabIdFromPort(port), invalidParamsError);
    return;
  }
  const requestPayload = SuperJSON.stringify(paramsParseResult.data);
  const requestParams: ParamsKeyValueArray = [
    ['payload', requestPayload],
    ['requestId', message.id as string],
  ];

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, requestParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.EtchRune, urlParams);
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

export default handleEtchRune;
