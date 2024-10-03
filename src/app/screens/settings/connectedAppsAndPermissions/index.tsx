import { dispatchEventToOrigin } from '@common/utils/messages/extensionToContentScript/dispatchEvent';
import { usePermissionsStore, usePermissionsUtils } from '@components/permissionsManager';
import type { Client as ClientType } from '@components/permissionsManager/schemas';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import Button from '@ui-library/button';
import { formatDate } from '@utils/date';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SubTitle, Title } from '../index.styles';
import ClientApp, { ClientPermissions } from './client';
import {
  ButtonContainer,
  ClientProperty,
  ClientPropertyContainer,
  ClientPropertyValue,
  Container,
  Row,
} from './index.styles';

export type ConnectedApp = ClientType & { lastUsed: number };

function ConnectedAppsAndPermissionsScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONNECTED_APPS' });
  const [selectedApp, setSelectedApp] = useState<ConnectedApp | null>(null);
  const navigate = useNavigate();
  const { removeClient, removeAllClients, getClientMetadata } = usePermissionsUtils();
  const { store } = usePermissionsStore();

  const getClientsSortedByLastUsed = useCallback((): ConnectedApp[] | undefined => {
    if (!store || !store.clients) {
      return undefined;
    }

    const clientsArray = Array.from(store.clients);

    return clientsArray
      .map((client) => {
        const lastUsed = getClientMetadata(client.id)?.lastUsed || 0;
        return { ...client, lastUsed };
      })
      .sort((a, b) => b.lastUsed - a.lastUsed);
  }, [store, getClientMetadata]);

  const clientsSortedByLastUsed = useMemo(
    () => getClientsSortedByLastUsed(),
    [getClientsSortedByLastUsed],
  );

  const handleBackButtonClick = useCallback(() => {
    if (selectedApp) {
      setSelectedApp(null);
      return;
    }
    navigate('/settings');
  }, [navigate, selectedApp]);

  const handleDisconnect = useCallback(async () => {
    if (selectedApp) {
      await removeClient(selectedApp.id);
      dispatchEventToOrigin(selectedApp.origin, {
        type: 'disconnect',
      });
      toast.success(t('DISCONNECT_SUCCESS'));
      setSelectedApp(null);
      return;
    }
    if (store) {
      store.clients.forEach((client) => {
        dispatchEventToOrigin(client.origin, {
          type: 'disconnect',
        });
      });
      await removeAllClients();
    }
    toast.success(t('DISCONNECT_ALL_SUCCESS'));
  }, [selectedApp, removeClient, removeAllClients, t, store]);

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        {selectedApp ? (
          <>
            <Title>{selectedApp.name}</Title>
            <ClientPropertyContainer>
              <Row>
                <ClientProperty>{t('URL')}</ClientProperty>
                <ClientPropertyValue>{selectedApp.name}</ClientPropertyValue>
              </Row>
              <Row>
                <ClientProperty>{t('LAST_USED')}</ClientProperty>
                <ClientPropertyValue>
                  {selectedApp.lastUsed ? formatDate(new Date(selectedApp.lastUsed)) : '-'}
                </ClientPropertyValue>
              </Row>
              <Row>
                <ClientProperty>{t('PERMISSIONS')}</ClientProperty>
                <ClientPermissions clientId={selectedApp.id} />
              </Row>
            </ClientPropertyContainer>
          </>
        ) : (
          <>
            <Title>{t('TITLE')}</Title>
            <SubTitle>{store?.clients.size === 0 ? t('EMPTY_MESSAGE') : t('SUBTITLE')}</SubTitle>
            {clientsSortedByLastUsed?.map((client) => (
              <ClientApp key={client.id} setSelectedApp={setSelectedApp} client={client} />
            ))}
          </>
        )}
        {(store?.clients?.size ?? 0) > 0 || selectedApp ? (
          <ButtonContainer>
            <Button
              title={selectedApp ? t('DISCONNECT') : t('DISCONNECT_ALL')}
              variant="secondary"
              onClick={handleDisconnect}
            />
          </ButtonContainer>
        ) : null}
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default ConnectedAppsAndPermissionsScreen;
