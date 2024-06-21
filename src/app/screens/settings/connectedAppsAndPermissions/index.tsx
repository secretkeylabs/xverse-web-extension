import { usePermissions } from '@components/permissionsManager';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  PermissionContainer,
  PermissionDescription,
  PermissionTitle,
  Row,
} from './index.styles';

function ConnectedAppsAndPermissionsScreen() {
  const navigate = useNavigate();
  const { getPermissionsStore, getClientPermissions, getResource } = usePermissions();
  const permissions = getPermissionsStore();

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  if (!permissions) {
    return null;
  }

  return (
    <>
      <TopRow title="Connected apps & permissions" onClick={handleBackButtonClick} />
      <Container>
        {[...permissions.clients].map((client) => (
          <div key={client.id}>
            <div>{client.name}</div>
            {getClientPermissions(client.id).map((p) => (
              <div key={p.resourceId}>
                {(() => {
                  const resource = getResource(p.resourceId);

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
