/* eslint-disable import/prefer-default-export */
import { RpcErrorCode, type SignPsbtRequestMessage } from '@sats-connect/core';
import {
  listenForOriginTabClose,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
  type ParamsKeyValueArray,
} from '../../legacy-external-message-handler';
import RequestsRoutes from '../../route-urls';
import { makeRPCError } from '../helpers';

export const handleSignPsbt = async (
  message: SignPsbtRequestMessage,
  port: chrome.runtime.Port,
) => {
  const requestParams: ParamsKeyValueArray = [
    ['requestId', message.id as string],
    ['signInputs', JSON.stringify(message.params.signInputs)],
    ['psbt', message.params.psbt],
  ];

  if (message.params.broadcast) requestParams.push(['broadcast', String(message.params.broadcast)]);

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
