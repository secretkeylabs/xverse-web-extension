import { getPopupPayload } from '@common/utils/popup';
import { usePermissions } from '@components/permissionsManager';
import { makeAccountPermissionDescription } from '@components/permissionsManager/resources';
import { Client, Permission, Resource } from '@components/permissionsManager/schemas';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

const Row = styled('div')({
  display: 'flex',
  justifyContent: 'space-around',
});

const PermissionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

const PermissionTitle = styled('div')({
  fontWeight: 'bold',
});

const PermissionDescription = styled('div')({
  paddingLeft: '10px',
});

/* eslint-disable import/prefer-default-export */
export function ConnectionRequest() {
  const [error, data] = getPopupPayload();
  const account = useSelectedAccount();

  const { addClient, addResource, setPermission } = usePermissions();

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
      id: `account-${account.id}`,
      name: `Account ${account.id}`,
    };
  }, [account.id, data?.context.origin]);

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
    if (!client || !resource || !permission) {
      return;
    }

    await addClient(client);
    await addResource(resource);
    await setPermission(permission);

    window.close();
  }, [addClient, addResource, client, permission, resource, setPermission]);

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
