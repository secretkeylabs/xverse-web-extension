/* eslint-disable import/prefer-default-export */
import { permissions, type Permissions } from '@secretkeylabs/xverse-core';
import { formatDate } from '@utils/date';
import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { SubTitle, Title } from '../../index.styles';
import { ClientProperty, ClientPropertyContainer, ClientPropertyValue, Row } from '../index.styles';
import type { ConnectedApp } from '../types';
import ClientApp, { ClientPermissions } from './client';

const { nameFromOrigin } = permissions.utils.originName;

function sortClientsByLastUsed(store: Permissions.Store.PermissionsStore): ConnectedApp[] {
  const clientsWithLastUsed = store.clients.map((client) => {
    const lastUsed = permissions.utils.store.getClientMetadata(store, client.id)?.lastUsed || 0;
    return { client, lastUsed };
  });

  // Sort by last used and then by origin. Using origin as fallback for stable
  // sorting since name may be undefined.
  return clientsWithLastUsed.sort(
    (a, b) => b.lastUsed - a.lastUsed || a.client.origin.localeCompare(b.client.origin),
  );
}

type SelectedAppProps = {
  selectedApp: ConnectedApp | null;
  setSelectedApp: Dispatch<SetStateAction<ConnectedApp | null>>;
  store: Permissions.Store.PermissionsStore;
};
export function AppListOrSelectedApp({ selectedApp, setSelectedApp, store }: SelectedAppProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONNECTED_APPS' });

  if (selectedApp) {
    return (
      <>
        <Title>{nameFromOrigin(selectedApp.client.origin)}</Title>
        <ClientPropertyContainer>
          <Row>
            <ClientProperty>{t('NAME')}</ClientProperty>
            <ClientPropertyValue>{nameFromOrigin(selectedApp.client.origin)}</ClientPropertyValue>
          </Row>
          <Row>
            <ClientProperty>{t('LAST_USED')}</ClientProperty>
            <ClientPropertyValue>
              {selectedApp.lastUsed ? formatDate(new Date(selectedApp.lastUsed)) : '-'}
            </ClientPropertyValue>
          </Row>
          <Row>
            <ClientProperty>{t('PERMISSIONS')}</ClientProperty>
            <ClientPermissions clientId={selectedApp.client.id} />
          </Row>
        </ClientPropertyContainer>
      </>
    );
  }

  return (
    <>
      <Title>{t('TITLE')}</Title>
      <SubTitle>{store.clients.length === 0 ? t('EMPTY_MESSAGE') : t('SUBTITLE')}</SubTitle>
      {sortClientsByLastUsed(store).map((connectedApp) => (
        <ClientApp
          key={connectedApp.client.id}
          setSelectedApp={setSelectedApp}
          connectedApp={connectedApp}
        />
      ))}
    </>
  );
}
