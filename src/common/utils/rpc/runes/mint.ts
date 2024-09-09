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

const MintRuneParamsSchema = z.object({
  appServiceFee: z.string().optional(),
  appServiceFeeAddress: z.string().optional(),
  destinationAddress: z.string(),
  feeRate: z.number(),
  refundAddress: z.string(),
  repeats: z.number(),
  runeName: z.string(),
  network: z.string().optional(),
});

const handleMintRune = async (message: WebBtcMessage<'runes_mint'>, port: chrome.runtime.Port) => {
  const paramsParseResult = MintRuneParamsSchema.safeParse(message.params);

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

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.MintRune, urlParams);
  listenForPopupClose({
    tabId,
    id,
    response: makeRPCError(message.id, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'User rejected request to mint a rune',
    }),
  });
  listenForOriginTabClose({ tabId });
};

export default handleMintRune;
