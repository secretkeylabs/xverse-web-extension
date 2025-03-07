/* eslint-disable import/prefer-default-export */
import { type Context } from '@common/utils/popup';
import { accountPurposeAddresses } from '@common/utils/rpc/btc/getAddresses/utils';
import { getBitcoinNetworkType } from '@common/utils/rpc/helpers';
import { sendInternalErrorMessage } from '@common/utils/rpc/responseMessages/errors';
import {
  sendConnectSuccessResponseMessage,
  sendRequestPermissionsSuccessResponseMessage,
} from '@common/utils/rpc/responseMessages/wallet';
import { usePermissions } from '@components/permissionsManager';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { ConnectRequestMessage, RequestPermissionsRequestMessage } from '@sats-connect/core';
import { permissions, type Permissions as TPermissions } from '@secretkeylabs/xverse-core';
import { useCallback } from 'react';

type Args = {
  context: Context;
  data: ConnectRequestMessage | RequestPermissionsRequestMessage;
};
export function useMakeHandleAccept({ context, data }: Args) {
  const account = useSelectedAccount();
  const { network } = useWalletSelector();
  const { addClient, addResource, setPermission } = usePermissions();

  return useCallback(async () => {
    const [clientIdError, clientId] = permissions.utils.store.makeClientId({
      origin: context.origin,
    });
    if (clientIdError) {
      sendInternalErrorMessage({
        tabId: context.tabId,
        messageId: data.id,
        message: 'Error creating client ID.',
      });
      window.close();
      return;
    }

    const client: TPermissions.Store.Client = {
      id: clientId,
      origin: context.origin,
    };

    addClient(client);

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

    const accountPermission: TPermissions.Store.Permission = {
      type: 'account',
      clientId: client.id,
      resourceId: resource.id,
      actions: {
        read: true,
      },
    };

    addResource(resource);
    setPermission(accountPermission);

    const walletResource: TPermissions.Store.Resource = {
      type: 'wallet',
      id: 'wallet',
      name: 'Wallet',
    };

    const walletPermission: TPermissions.Store.Permission = {
      type: 'wallet',
      clientId: client.id,
      resourceId: 'wallet',
      actions: {
        readNetwork: true,
      },
    };

    addResource(walletResource);
    setPermission(walletPermission);

    if (data.method === 'wallet_requestPermissions')
      sendRequestPermissionsSuccessResponseMessage({
        messageId: data.id,
        tabId: context.tabId,
        result: true,
      });
    else {
      const purposes = data.params?.addresses;
      const addresses = accountPurposeAddresses(
        account,
        purposes ? { type: 'select', purposes } : { type: 'all' },
      );

      sendConnectSuccessResponseMessage({
        messageId: data.id,
        tabId: context.tabId,
        result: {
          id: accountId,
          walletType: account.accountType ?? 'software',
          addresses,
          network: {
            bitcoin: {
              name: getBitcoinNetworkType(network.type),
            },
            stacks: {
              name: network.type,
            },
          },
        },
      });
    }

    window.close();
  }, [
    account,
    addClient,
    addResource,
    context.origin,
    context.tabId,
    data.id,
    data.method,
    data.params,
    network.type,
    setPermission,
  ]);
}
