import { RpcErrorCode, type RunesEtchRequestMessage } from '@sats-connect/core';
import SuperJSON from 'superjson';
import {
  listenForOriginTabClose,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
  type ParamsKeyValueArray,
} from '../../legacy-external-message-handler';
import RequestsRoutes from '../../route-urls';
import { makeRPCError } from '../helpers';

const handleEtchRune = async (message: RunesEtchRequestMessage, port: chrome.runtime.Port) => {
  const requestPayload = SuperJSON.stringify(message.params);
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
      message: 'User rejected request to etch a rune',
    }),
  });
  listenForOriginTabClose({ tabId });
};

export default handleEtchRune;
