import { usePermissions } from '@components/permissionsManager';
import * as utils from '@components/permissionsManager/utils';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useQuery } from '@tanstack/react-query';
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
  const { getPermissionsStore } = usePermissions();
  const { isFetching, data: store } = useQuery({
    queryKey: ['ConnectedAppsAndPermissionsScreen', 'permissionsStore'],
    queryFn: async () => {
      const s = await getPermissionsStore();
      console.log('[ARY]: store inside qfun', s);
      return s;
    },
  });

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  if (isFetching) {
    return null;
  }

  if (!store) {
    return null;
  }

  console.log('[ARY]: store not iterable?', store);

  return (
    <>
      <TopRow title="Connected apps & permissions" onClick={handleBackButtonClick} />
      <Container>
        {[...store.clients].map((client) => (
          <div key={client.id}>
            <div>{client.name}</div>
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
