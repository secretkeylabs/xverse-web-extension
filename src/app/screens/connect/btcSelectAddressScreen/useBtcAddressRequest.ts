import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { getPopupPayload, type Context } from '@common/utils/popup';
import { useApprovalSearchParams } from '@common/utils/popup/useApprovalSearchParams';
import { accountPurposeAddresses } from '@common/utils/rpc/btc/getAddresses/utils';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
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
import { useCallback, useEffect, useState } from 'react';
import * as v from 'valibot';

interface UseRequestHelperReturn {
  loading: boolean;
  error?: string;
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

const emptyHandlers = {
  loading: true as const,
  legacyRequestNetworkType: undefined,
  message: undefined,
  purposes: [] as AddressPurpose[],
  origin: '',
  async sendApprovedResponse() {},
  sendCancelledResponse() {},
};

export default function useRequestHelper(): UseRequestHelperReturn {
  const account = useSelectedAccount();
  const transitionalGrantReadPermissions = useMakeTransitionalGrantAccountReadPermissions();
  const approvalParams = useApprovalSearchParams();
  const [state, setState] = useState<UseRequestHelperReturn>(emptyHandlers);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [errorGetAddresses, popupPayloadGetAddresses] = await getPopupPayload((data) =>
        v.parse(getAddressesRequestMessageSchema, data),
      );
      if (!cancelled && !errorGetAddresses && popupPayloadGetAddresses) {
        const { context, data } = popupPayloadGetAddresses;
        setState({
          loading: false,
          message: data.params.message,
          origin: context.origin,
          legacyRequestNetworkType: undefined,
          purposes: data.params.purposes,
          async sendApprovedResponse() {
            const addresses = accountPurposeAddresses(account, {
              type: 'select',
              purposes: popupPayloadGetAddresses.data.params.purposes,
            });

            sendRpcResponse(context.tabId, makeRpcSuccessResponse(data.id, { addresses }));
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
        });
        return;
      }

      const [errorGetAccounts, popupPayloadGetAccounts] = await getPopupPayload((data) =>
        v.parse(getAccountsRequestMessageSchema, data),
      );
      if (!cancelled && !errorGetAccounts && popupPayloadGetAccounts) {
        const { context, data } = popupPayloadGetAccounts;
        setState({
          loading: false,
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
        });
        return;
      }

      // Legacy sats-connect getAddress (params via SW store or embedded URL).
      if (approvalParams.status === 'loading') {
        return;
      }
      if (approvalParams.status === 'error') {
        if (!cancelled) {
          setState({
            ...emptyHandlers,
            loading: false,
            error: approvalParams.error,
          });
        }
        return;
      }

      const params = approvalParams.params;
      const token = params.get('addressRequest') ?? '';
      const origin = params.get('origin') ?? '';
      let legacyRequestNetworkType: BitcoinNetworkType | undefined;
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

      if (!cancelled) {
        setState({
          loading: false,
          legacyRequestNetworkType,
          message,
          origin,
          purposes: purposes ?? [],
          async sendApprovedResponse() {
            const response: GetAddressResponse = {
              addresses,
            };
            const addressMessage = {
              source: MESSAGE_SOURCE,
              method: SatsConnectMethods.getAddressResponse,
              payload: { addressRequest: token, addressResponse: response },
            };
            chrome.tabs.sendMessage(tabId, addressMessage);
          },
          sendCancelledResponse() {
            const addressMessage = {
              source: MESSAGE_SOURCE,
              method: SatsConnectMethods.getAddressResponse,
              payload: { addressRequest: token, addressResponse: 'cancel' },
            };
            chrome.tabs.sendMessage(tabId, addressMessage);
          },
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [account, approvalParams, transitionalGrantReadPermissions]);

  return state;
}
