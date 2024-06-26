import { getPopupPayload } from '@common/utils/popup';
import { sendRequestPermissionsSuccessResponseMessage } from '@common/utils/rpc/responseMessages/wallet';
import { usePermissionsUtils } from '@components/permissionsManager';
import {
  makeAccountPermissionDescription,
  makeAccountResourceId,
} from '@components/permissionsManager/resources';
import { Client, Permission, Resource } from '@components/permissionsManager/schemas';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { connectSchema } from '@sats-connect/core';
import { useCallback, useMemo } from 'react';
import * as v from 'valibot';
import { PermissionContainer, PermissionDescription, PermissionTitle, Row } from './index.styles';

/* eslint-disable import/prefer-default-export */
export function ConnectionRequest() {
  const { network } = useWalletSelector();
  const [error, data] = getPopupPayload((maybeData) => v.parse(connectSchema, maybeData));
  const account = useSelectedAccount();

  const { addClient, addResource, setPermission } = usePermissionsUtils();

  const handleCancel = useCallback(() => {
    window.close();
  }, []);

  const client: Client | null = useMemo(() => {
    const origin = data?.context.origin;

    if (!origin) {
      return null;
    }

    return {
      id: data.context.origin,
      name: data.context.origin,
    };
  }, [data?.context.origin]);

  const resource: Resource | null = useMemo(() => {
    const origin = data?.context.origin;
    if (!origin) {
      return null;
    }

    return {
      id: makeAccountResourceId({ accountId: account.id, networkType: network.type }),
      name: `Account ${account.id} (${network.type})`,
    };
  }, [account.id, data?.context.origin, network.type]);

  const permission: Permission | null = useMemo(() => {
    if (!client || !resource) {
      return null;
    }

    return {
      clientId: client.id,
      resourceId: resource.id,
      actions: new Set(['read']),
    };
  }, [client, resource]);

  const handleAccept = useCallback(async () => {
    const messageId = data?.data.id;
    if (!messageId) return;

    const tabId = data?.context.tabId;
    if (typeof tabId !== 'number') return;

    if (!client || !resource || !permission) {
      return;
    }

    await addClient(client);
    await addResource(resource);
    await setPermission(permission);

    sendRequestPermissionsSuccessResponseMessage({
      messageId,
      tabId,
      result: undefined,
    });

    window.close();
  }, [
    addClient,
    addResource,
    client,
    data?.context.tabId,
    data?.data.id,
    permission,
    resource,
    setPermission,
  ]);

  if (error) {
    return <div>Error processing connection request.</div>;
  }

  if (!resource || !client || !permission) {
    // eslint-disable-next-line no-console
    console.error(resource, client, permission);
    return <div>Missing resource, client or permission</div>;
  }

  const { context } = data;
  return (
    <div>
      <div>User has requested connection</div>
      <div>{JSON.stringify(context, null, 2)}</div>
      <div>The application {context.origin} is requesting the following permissions:</div>

      <PermissionContainer>
        <PermissionTitle>{resource.name}</PermissionTitle>
        <PermissionDescription>
          {makeAccountPermissionDescription(permission.actions, client)}
        </PermissionDescription>
      </PermissionContainer>

      <Row>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
        <button type="button" onClick={handleAccept}>
          Accept
        </button>
      </Row>
    </div>
  );
}
