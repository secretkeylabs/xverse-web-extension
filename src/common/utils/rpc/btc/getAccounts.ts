import { WebBtcMessage } from '@common/types/message-types';
import { getTabIdFromPort } from '@common/utils';
import { AddressPurpose, RpcErrorCode } from 'sats-connect';
import { z } from 'zod';
import {
  ParamsKeyValueArray,
  listenForOriginTabClose,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../legacy-external-message-handler';
import RequestsRoutes from '../../route-urls';
import { makeRPCError, sendRpcResponse } from '../helpers';

const AddressPurposeSchema = z.enum([
  AddressPurpose.Ordinals,
  AddressPurpose.Payment,
  AddressPurpose.Stacks,
]);

const GetAccountsParamsSchema = z.object({
  purposes: z.array(AddressPurposeSchema),
  message: z.string().optional(),
});

export const handleGetAccounts = async (
  message: WebBtcMessage<'getAccounts'>,
  port: chrome.runtime.Port,
) => {
  const paramsParseResult = GetAccountsParamsSchema.safeParse(message.params);

  if (!paramsParseResult.success) {
    const invalidParamsError = makeRPCError(message.id, {
      code: RpcErrorCode.INVALID_PARAMS,
      message: 'Invalid params',
    });
    sendRpcResponse(getTabIdFromPort(port), invalidParamsError);
    return;
  }

  const requestParams: ParamsKeyValueArray = [
    ['purposes', paramsParseResult.data.purposes.toString()],
    ['requestId', message.id as string],
    ['rpcMethod', message.method],
  ];

  if (paramsParseResult.data.message) {
    requestParams.push(['message', paramsParseResult.data.message]);
  }

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, requestParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.AddressRequest, urlParams);
  listenForPopupClose({
    tabId,
    id,
    response: makeRPCError(message.id, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'User rejected request to get accounts',
    }),
  });
  listenForOriginTabClose({ tabId });
};

export default handleGetAccounts;
