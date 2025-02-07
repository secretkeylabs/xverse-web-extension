/* eslint-disable import/prefer-default-export */
import { usePermissions } from '@components/permissionsManager';
import { permissions } from '@secretkeylabs/xverse-core';
import { formatDate } from '@utils/date';
import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { SubTitle, Title } from '../../index.styles';
import { ClientProperty, ClientPropertyContainer, ClientPropertyValue, Row } from '../index.styles';
import type { ConnectedApp } from '../types';
import ClientApp, { ClientPermissions } from './client';

const { nameFromOrigin } = permissions.utils.originName;

type SelectedAppProps = {
  selectedApp: ConnectedApp | null;
  setSelectedApp: Dispatch<SetStateAction<ConnectedApp | null>>;
};
export function AppListOrSelectedApp({ selectedApp, setSelectedApp }: SelectedAppProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONNECTED_APPS' });
  const { getClients, getClientMetadata } = usePermissions();

  const sortedClientsByLastUsed = getClients()
    .map((c) => ({ client: c, lastUsed: getClientMetadata(c.id)?.lastUsed || 0 }))
    .sort((a, b) => b.lastUsed - a.lastUsed || a.client.origin.localeCompare(b.client.origin));

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
      <SubTitle>{getClients().length === 0 ? t('EMPTY_MESSAGE') : t('SUBTITLE')}</SubTitle>
      {sortedClientsByLastUsed.map((connectedApp) => (
        <ClientApp
          key={connectedApp.client.id}
          setSelectedApp={setSelectedApp}
          connectedApp={connectedApp}
        />
      ))}
    </>
  );
}
