/* eslint-disable import/prefer-default-export */
import { dispatchEventToOrigin } from '@common/utils/messages/extensionToContentScript/dispatchEvent';
import { EnsureStoreLoaded, usePermissionsUtils } from '@components/permissionsManager';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import type { Permissions } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppListOrSelectedApp } from './components/selectedApp';
import { ButtonContainer, Container } from './index.styles';
import type { ConnectedApp } from './types';

type ConnectedAppsAndPermissionsScreenProps = { store: Permissions.Store.PermissionsStore };
function ConnectedAppsAndPermissionsScreen({ store }: ConnectedAppsAndPermissionsScreenProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONNECTED_APPS' });
  const [selectedApp, setSelectedApp] = useState<ConnectedApp | null>(null);
  const navigate = useNavigate();
  const { removeClient, removeAllClients } = usePermissionsUtils();

  const handleBackButtonClick = useCallback(() => {
    if (selectedApp) {
      setSelectedApp(null);
      return;
    }
    navigate('/settings');
  }, [navigate, selectedApp]);

  const handleDisconnect = useCallback(async () => {
    // Only disconnect the selected app when an app is selected.
    if (selectedApp) {
      await removeClient(selectedApp.client.id);
      dispatchEventToOrigin(selectedApp.client.origin, {
        type: 'disconnect',
      });
      toast.success(t('DISCONNECT_SUCCESS'));
      setSelectedApp(null);
      return;
    }

    store.clients.forEach((client) => {
      dispatchEventToOrigin(client.origin, {
        type: 'disconnect',
      });
    });
    await removeAllClients();
    toast.success(t('DISCONNECT_ALL_SUCCESS'));
  }, [selectedApp, removeClient, removeAllClients, t, store]);

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <AppListOrSelectedApp
          selectedApp={selectedApp}
          setSelectedApp={setSelectedApp}
          store={store}
        />
        {(store.clients?.length ?? 0) > 0 || selectedApp ? (
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

export function ConnectedAppsAndPermissions() {
  return (
    <EnsureStoreLoaded
      renderChildren={(store) => <ConnectedAppsAndPermissionsScreen store={store} />}
    />
  );
}
