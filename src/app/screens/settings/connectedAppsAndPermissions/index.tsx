import { usePermissionsStore, usePermissionsUtils } from '@components/permissionsManager';
import * as utils from '@components/permissionsManager/utils';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ClientHeader,
  ClientName,
  Container,
  PermissionContainer,
  PermissionDescription,
  PermissionTitle,
  Row,
} from './index.styles';

function ConnectedAppsAndPermissionsScreen() {
  const navigate = useNavigate();
  const { removeAllClientPermissions } = usePermissionsUtils();
  const { store } = usePermissionsStore();

  const handleBackButtonClick = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  if (!store) {
    return null;
  }

  return (
    <>
      <TopRow title="Connected apps & permissions" onClick={handleBackButtonClick} />
      <Container>
        {[...store.clients].map((client) => (
          <div key={client.id}>
            <ClientHeader>
              <ClientName>{client.name}</ClientName>
              <Button
                type="button"
                onClick={() => {
                  removeAllClientPermissions(client.id);
                }}
              >
                Disconnect
              </Button>
            </ClientHeader>
            {utils.getClientPermissions(store.permissions, client.id).map((p) => (
              <div key={p.resourceId}>
                {(() => {
                  const resource = utils.getResource(store.resources, p.resourceId);

                  if (!resource) {
                    return null;
                  }

                  return (
                    <Row key={p.resourceId}>
                      <PermissionContainer>
                        <PermissionTitle>{resource.name}</PermissionTitle>
                        <PermissionDescription>
                          {[...p.actions].map((a) => (
                            <div key={a}>{a}</div>
                          ))}
                        </PermissionDescription>
                      </PermissionContainer>
                    </Row>
                  );
                })()}
              </div>
            ))}
          </div>
        ))}
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default ConnectedAppsAndPermissionsScreen;
