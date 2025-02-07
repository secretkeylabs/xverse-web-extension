/* eslint-disable import/prefer-default-export */
import { dispatchEventToOrigin } from '@common/utils/messages/extensionToContentScript/dispatchEvent';
import { usePermissions } from '@components/permissionsManager';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import Button from '@ui-library/button';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppListOrSelectedApp } from './components/selectedApp';
import { ButtonContainer, Container } from './index.styles';
import type { ConnectedApp } from './types';

export function ConnectedAppsAndPermissions() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONNECTED_APPS' });
  const [selectedApp, setSelectedApp] = useState<ConnectedApp | null>(null);
  const navigate = useNavigate();
  const { removeClient, removeAllClients, getClients } = usePermissions();

  const handleBackButtonClick = useCallback(() => {
    if (selectedApp) {
      setSelectedApp(null);
      return;
    }
    navigate('/settings');
  }, [navigate, selectedApp]);

  const handleDisconnect = useCallback(() => {
    // Only disconnect the selected app when an app is selected.
    if (selectedApp) {
      removeClient(selectedApp.client.id);
      dispatchEventToOrigin(selectedApp.client.origin, {
        type: 'disconnect',
      });
      toast.success(t('DISCONNECT_SUCCESS'));
      setSelectedApp(null);
      return;
    }

    // NOTE: Clients must be retrieved prior to their deletion so as to know
    // which origins need to be notified once they've been deleted from the
    // store.
    const clients = getClients();
    removeAllClients();
    clients.forEach((client) => {
      dispatchEventToOrigin(client.origin, {
        type: 'disconnect',
      });
    });
    toast.success(t('DISCONNECT_ALL_SUCCESS'));
  }, [selectedApp, getClients, removeAllClients, t, removeClient]);

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <AppListOrSelectedApp selectedApp={selectedApp} setSelectedApp={setSelectedApp} />
        {getClients().length > 0 || selectedApp ? (
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
