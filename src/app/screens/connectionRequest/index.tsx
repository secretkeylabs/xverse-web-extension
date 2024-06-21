import { getPopupPayload } from '@common/utils/popup';
import { usePermissions } from '@components/permissionsManager';
import { useCallback } from 'react';
import styled from 'styled-components';

const Row = styled('div')({
  display: 'flex',
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

  const { addClientToGroup } = usePermissions();

  const handleCancel = useCallback(() => {
    window.close();
  }, []);

  const handleAccept = useCallback(async () => {
    const origin = data?.context.origin;

    if (!origin) {
      // eslint-disable-next-line no-console
      console.error('Expected `origin` to be defined.');
      return;
    }
    await addClientToGroup(origin, 'default');
  }, [addClientToGroup, data?.context.origin]);

  if (error) {
    return <div>Error processing connection request.</div>;
  }

  const { context } = data;
  return (
    <div>
      <div>User has requested connection</div>
      <div>{JSON.stringify(context, null, 2)}</div>
      <div>The application {context.origin} is requesting the following permissions:</div>

      <Row>
        <button onClick={handleCancel}>Cancel</button>
        <button onClick={handleAccept}>Accept</button>
      </Row>
    </div>
  );
}
