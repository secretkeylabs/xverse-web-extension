import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { getPopupPayload, type Context } from '@common/utils/popup';
import { accountPurposeAddresses } from '@common/utils/rpc/btc/getAddresses/utils';
import {
  getBitcoinNetworkType,
  makeRPCError,
  makeRpcSuccessResponse,
  sendRpcResponse,
} from '@common/utils/rpc/helpers';
import { usePermissions } from '@components/permissionsManager';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  AddressPurpose,
  BitcoinNetworkType,
  RpcErrorCode,
  getAccountsRequestMessageSchema,
  getAddressesRequestMessageSchema,
  type GetAccountsResult,
  type GetAddressOptions,
  type GetAddressResponse,
} from '@sats-connect/core';
import { permissions, type Permissions } from '@secretkeylabs/xverse-core';
import { decodeToken } from 'jsontokens';
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import * as v from 'valibot';

interface UseRequestHelperReturn {
  legacyRequestNetworkType: BitcoinNetworkType | undefined;
  message: string | undefined;
  purposes: AddressPurpose[];
  origin: string;
  sendApprovedResponse: () => Promise<void>;
  sendCancelledResponse: () => void;
}

/**
 * During the transition to using permissions with `wallet_requestPermissions`,
 * this function is used to grant the client read permissions to the account,
 * ensuring that dApps using the `getAccounts` method to establish a
 * "connection" are able to query methods requiring permissions, allowing the
 * wallet to remain backwards compatible.
 */
function useMakeTransitionalGrantAccountReadPermissions() {
  const { network } = useWalletSelector();
  const account = useSelectedAccount();
  const { addClient, addResource, setPermission } = usePermissions();
  return useCallback(
    async (context: Context) => {
      const [clientIdError, clientId] = permissions.utils.store.makeClientId({
        origin: context.origin,
      });
      if (clientIdError) {
        throw new Error('Error creating client ID.');
      }

      const client: Permissions.Store.Client = {
        id: clientId,
        origin: context.origin,
      };

      const accountId = permissions.utils.account.makeAccountId({
        accountId: account.id,
        networkType: network.type,
        masterPubKey: account.masterPubKey,
      });

      const resource = permissions.resources.account.makeAccountResource({
        accountId,
        masterPubKey: account.masterPubKey,
        networkType: network.type,
      });

      const permission: Permissions.Store.Permission = {
        type: 'account',
        clientId: client.id,
        resourceId: resource.id,
        actions: { read: true },
      };

      await addClient(client);
      await addResource(resource);
      await setPermission(permission);
    },
    [account.id, account.masterPubKey, addClient, addResource, network.type, setPermission],
  );
}

export default function useRequestHelper(): UseRequestHelperReturn {
  const account = useSelectedAccount();
  const { network } = useWalletSelector();
  const transitionalGrantReadPermissions = useMakeTransitionalGrantAccountReadPermissions();

  // Used for handling a legacy request at the end of this function. Although
  // its use is discouraged (see its docstring), it was part of the initial
  // implementation for handling a legacy request, and is used to avoid changing
  // how legacy requests are handled.
  const { search } = useLocation();

  const [errorGetAddresses, popupPayloadGetAddresses] = getPopupPayload((data) =>
    v.parse(getAddressesRequestMessageSchema, data),
  );
  if (!errorGetAddresses) {
    const { context, data } = popupPayloadGetAddresses;
    return {
      message: data.params.message,
      origin: context.origin,
      legacyRequestNetworkType: undefined,
      purposes: data.params.purposes,
      async sendApprovedResponse() {
        const addresses = accountPurposeAddresses(account, {
          type: 'select',
          purposes: popupPayloadGetAddresses.data.params.purposes,
        });

        sendRpcResponse(
          context.tabId,
          makeRpcSuccessResponse(data.id, {
            addresses,
            network: {
              bitcoin: {
                name: getBitcoinNetworkType(network.type),
              },
              stacks: {
                name: getBitcoinNetworkType(network.type),
              },
            },
          }),
        );
      },
      sendCancelledResponse() {
        sendRpcResponse(
          context.tabId,
          makeRPCError(data.id, {
            code: RpcErrorCode.USER_REJECTION,
            message: `User rejected ${data.method} request.`,
          }),
        );
      },
    };
  }

  const [errorGetAccounts, popupPayloadGetAccounts] = getPopupPayload((data) =>
    v.parse(getAccountsRequestMessageSchema, data),
  );
  if (!errorGetAccounts) {
    const { context, data } = popupPayloadGetAccounts;
    return {
      message: data.params.message,
      origin: context.origin,
      legacyRequestNetworkType: undefined,
      purposes: data.params.purposes,
      async sendApprovedResponse() {
        await transitionalGrantReadPermissions(context);
        const addresses: GetAccountsResult = accountPurposeAddresses(account, {
          type: 'select',
          purposes: popupPayloadGetAccounts.data.params.purposes,
        }).map((address) => ({
          ...address,
          walletType: account.accountType ?? 'software',
        }));
        sendRpcResponse(context.tabId, makeRpcSuccessResponse(data.id, addresses));
      },
      sendCancelledResponse() {
        sendRpcResponse(
          context.tabId,
          makeRPCError(data.id, {
            code: RpcErrorCode.USER_REJECTION,
            message: `User rejected ${data.method} request.`,
          }),
        );
      },
    };
  }

  // When none of the above succeed in processing a request, assume it's a legacy request.
  {
    const params = new URLSearchParams(search);
    const token = params.get('addressRequest') ?? '';
    const origin = params.get('origin') ?? '';
    let legacyRequestNetworkType;
    let request: GetAddressOptions | undefined;
    if (token) {
      request = decodeToken(token) as any as GetAddressOptions;
      legacyRequestNetworkType = request.payload.network.type;
    }
    const message = request?.payload.message ?? params.get('message') ?? '';
    const pArray = params.get('purposes');
    const purposes = request?.payload.purposes ?? (pArray?.split(',') as AddressPurpose[]);
    const addresses = accountPurposeAddresses(account, { type: 'select', purposes });
    const tabId = Number(params.get('tabId') ?? '0');
    const sendApprovedResponse = async () => {
      const response: GetAddressResponse = {
        addresses,
      };
      const addressMessage = {
        source: MESSAGE_SOURCE,
        method: SatsConnectMethods.getAddressResponse,
        payload: { addressRequest: token, addressResponse: response },
      };
      chrome.tabs.sendMessage(tabId, addressMessage);
    };
    const sendCancelledResponse = () => {
      const addressMessage = {
        source: MESSAGE_SOURCE,
        method: SatsConnectMethods.getAddressResponse,
        payload: { addressRequest: token, addressResponse: 'cancel' },
      };
      chrome.tabs.sendMessage(tabId, addressMessage);
    };

    return {
      legacyRequestNetworkType,
      message,
      origin,
      purposes,
      sendApprovedResponse,
      sendCancelledResponse,
    };
  }
}
