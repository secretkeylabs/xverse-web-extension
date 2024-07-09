import { WebBtcMessage } from '@common/types/message-types';
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import { AddressPurpose, RpcErrorCode } from '@sats-connect/core';
import rootStore from '@stores/index';
import { z } from 'zod';
import {
  ParamsKeyValueArray,
  listenForOriginTabClose,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../../legacy-external-message-handler';
import RequestsRoutes from '../../../route-urls';
import { hasPermissions, makeRPCError, sendRpcResponse } from '../../helpers';
import { sendGetAddressesSuccessResponseMessage } from '../../responseMessages/bitcoin';
import { accountPurposeAddresses } from './utils';

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

  const { origin, tabId } = makeContext(port);
  if (await hasPermissions(origin)) {
    const {
      selectedAccountIndex,
      selectedAccountType,
      accountsList: softwareAccountsList,
      ledgerAccountsList,
    } = rootStore.store.getState().walletState;

    const account = getSelectedAccount({
      selectedAccountIndex,
      selectedAccountType,
      softwareAccountsList,
      ledgerAccountsList,
    });

    if (account) {
      const addresses = accountPurposeAddresses(account, message.params.purposes);
      sendGetAddressesSuccessResponseMessage({
        tabId,
        messageId: message.id,
        result: {
          addresses,
        },
      });
      return;
    }
  }

  const requestParams: ParamsKeyValueArray = [
    ['purposes', message.params.purposes.toString()],
    ['requestId', message.id as string],
    ['rpcMethod', message.method],
  ];

  if (message.params.message) {
    requestParams.push(['message', message.params.message]);
  }

  const { urlParams } = makeSearchParamsWithDefaults(port, requestParams);

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
