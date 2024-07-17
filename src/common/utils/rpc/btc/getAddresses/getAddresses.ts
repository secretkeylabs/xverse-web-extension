/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext, openPopup } from '@common/utils/popup';
import { getAddressesRequestMessageSchema, type RpcRequestMessage } from '@sats-connect/core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import RequestsRoutes from '../../../route-urls';
import { handleInvalidMessage } from '../../handle-invalid-message';
import { hasPermissions, makeSendPopupClosedUserRejectionMessage } from '../../helpers';
import { sendGetAddressesSuccessResponseMessage } from '../../responseMessages/bitcoin';
import { accountPurposeAddresses } from './utils';

export const handleGetAddresses = async (message: RpcRequestMessage, port: chrome.runtime.Port) => {
  const parseResult = v.safeParse(getAddressesRequestMessageSchema, message);

  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
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
      const addresses = accountPurposeAddresses(account, parseResult.output.params.purposes);
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

  await openPopup({
    path: RequestsRoutes.AddressRequest,
    data: parseResult.output,
    context: makeContext(port),
    onClose: makeSendPopupClosedUserRejectionMessage({
      tabId: getTabIdFromPort(port),
      messageId: parseResult.output.id,
    }),
  });
};
