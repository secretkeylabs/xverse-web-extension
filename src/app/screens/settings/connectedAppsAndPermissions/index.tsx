import { usePermissionsStore, usePermissionsUtils } from '@components/permissionsManager';
import * as utils from '@components/permissionsManager/utils';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SubTitle, Title } from '../index.styles';
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
  const { t } = useTranslation('translation', { keyPrefix: 'CONNECTED_APPS' });
  const navigate = useNavigate();
  const { removeClient } = usePermissionsUtils();
  const { store } = usePermissionsStore();

  const handleBackButtonClick = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  if (!store) {
    return null;
  }

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('TITLE')}</Title>
        <SubTitle> {store.clients.size === 0 ? t('EMPTY_MESSAGE') : t('SUBTITLE')}</SubTitle>
        {[...store.clients].map((client) => (
          <div key={client.id}>
            <ClientHeader>
              <ClientName>{client.name}</ClientName>
              <Button
                type="button"
                onClick={() => {
                  removeClient(client.id);
                }}
              >
                Disconnect
              </Button>
            </ClientHeader>
            {utils
              .getClientPermissions(store.permissions, client.id)
              .sort((p1, p2) => p1.resourceId.localeCompare(p2.resourceId))
              .map((p) => (
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
