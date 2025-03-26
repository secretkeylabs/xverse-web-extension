import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import {
  AddressPurpose,
  AddressType,
  RpcErrorCode,
  type StxGetAddressesRequestMessage,
} from '@sats-connect/core';
import rootStore from '@stores/index';
import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../../../legacy-external-message-handler';
import RequestsRoutes from '../../../route-urls';
import { getBitcoinNetworkType, makeRPCError } from '../../helpers';
import { sendGetAddressesSuccessResponseMessage } from '../../responseMessages/stacks';

const handleGetStxAddresses = async (
  message: StxGetAddressesRequestMessage,
  port: chrome.runtime.Port,
) => {
  const popupParams = {
    messageId: String(message.id),
    rpcMethod: 'stx_getAddresses',
  };

  const tabId = getTabIdFromPort(port);

  const {
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    network,
  } = rootStore.store.getState().walletState;

  const account = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    network: network.type,
  });

  if (!account) {
    const { urlParams } = makeSearchParamsWithDefaults(port, popupParams);

    const { id } = await triggerRequestWindowOpen(RequestsRoutes.StxAddressRequest, urlParams);
    listenForPopupClose({
      tabId,
      id,
      response: makeRPCError(message.id, {
        code: RpcErrorCode.USER_REJECTION,
        message: 'User rejected request to get addresses',
      }),
    });
    return;
  }

  sendGetAddressesSuccessResponseMessage({
    tabId,
    messageId: message.id,
    result: {
      addresses: [
        {
          address: account.stxAddress,
          publicKey: account.stxPublicKey,
          addressType: AddressType.stacks,
          purpose: AddressPurpose.Stacks,
          walletType: account.accountType ?? 'software',
        },
      ],
      network: {
        bitcoin: {
          name: getBitcoinNetworkType(network.type),
        },
        stacks: {
          name: getBitcoinNetworkType(network.type),
        },
      },
    },
  });
};

export default handleGetStxAddresses;
