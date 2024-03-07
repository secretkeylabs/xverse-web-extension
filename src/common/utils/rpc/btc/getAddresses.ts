import { WebBtcMessage } from '@common/types/message-types';
import { getTabIdFromPort } from '@common/utils';
import { AddressPurpose, RpcErrorCode } from 'sats-connect';
import { z } from 'zod';
import {
  OtherParams,
  listenForOriginTabClose,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../legacy-external-message-handler';
import RequestsRoutes from '../../route-urls';
import { makeRPCError, sendRpcResponse } from '../helpers';

const AddressPurposeSchema = z.enum([AddressPurpose.Ordinals, AddressPurpose.Payment]);

const GetAddressesParamsSchema = z.object({
  purposes: z.array(AddressPurposeSchema),
  message: z.string().optional(),
});

export const handleGetAddresses = async (
  message: WebBtcMessage<'getAddresses'>,
  port: chrome.runtime.Port,
) => {
  const paramsParseResult = GetAddressesParamsSchema.safeParse(message.params);

  if (!paramsParseResult.success) {
    const invalidParamsError = makeRPCError(message.id, {
      code: RpcErrorCode.INVALID_PARAMS,
      message: 'Invalid params',
    });
    sendRpcResponse(getTabIdFromPort(port), invalidParamsError);
    return;
  }

  const requestParams: OtherParams = [
    ['purposes', message.params.purposes.toString()],
    ['requestId', message.id as string],
  ];

  if (message.params.message) {
    requestParams.push(['message', message.params.message]);
  }

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, requestParams);

  const { id } = await triggerRequestWindowOpen(RequestsRoutes.AddressRequest, urlParams);
  listenForPopupClose({
    tabId,
    id,
    response: makeRPCError(message.id, {
      code: RpcErrorCode.USER_REJECTION,
      message: 'User rejected request to get addresses',
    }),
  });
  listenForOriginTabClose({ tabId });
};

export default handleGetAddresses;
