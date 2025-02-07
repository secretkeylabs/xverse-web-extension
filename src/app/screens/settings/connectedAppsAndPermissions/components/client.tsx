import { usePermissions } from '@components/permissionsManager';
import { CaretRight } from '@phosphor-icons/react';
import {
  getAppIconFromWebManifest,
  permissions,
  type Permissions,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'styled-components';
import {
  Client,
  ClientDescription,
  ClientHeader,
  ClientName,
  DappIcon,
  DappIconPlaceholder,
  PermissionContainer,
  PermissionText,
} from '../index.styles';
import type { ConnectedApp } from '../types';

const { nameFromOrigin } = permissions.utils.originName;

async function getWebsiteInfo(url: string): Promise<{ name: string; icon: string }> {
  try {
    const parsedUrl = new URL(url);
    const { hostname } = parsedUrl;
    const appIcon = await getAppIconFromWebManifest(url);
    return { name: hostname, icon: appIcon };
  } catch (error) {
    return { name: '', icon: '' };
  }
}

type PermissionsProps = {
  clientId: Permissions.Store.Client['id'];
  color?: string;
};
export function ClientPermissions({ clientId, color }: PermissionsProps) {
  const utils = usePermissions();
  const sortedPermissions = utils
    .getClientPermissions(clientId)
    .sort((p1, p2) => p1.resourceId.localeCompare(p2.resourceId));

  return sortedPermissions.map((p) => {
    const resource = utils.getResource(p.resourceId);
    if (!resource) return null;

    return (
      <PermissionContainer key={p.resourceId}>
        {Object.entries(p.actions).map(
          ([name, isEnabled]) =>
            isEnabled && (
              <PermissionText color={color} key={name}>
                {name}
              </PermissionText>
            ),
        )}
      </PermissionContainer>
    );
  });
}

type AppIconProps = {
  src?: string;
};

function AppIcon({ src }: AppIconProps) {
  if (!src) {
    return <DappIconPlaceholder width={32} height={32} color="white" />;
  }

  return <DappIcon src={src} alt="Dapp logo" />;
}

interface Props {
  connectedApp: ConnectedApp;
  setSelectedApp: (app: ConnectedApp) => void;
}

export default function ClientApp({ connectedApp, setSelectedApp }: Props) {
  const theme = useTheme();
  const { data: appDetails } = useQuery({
    queryKey: ['websiteInfo', connectedApp.client.id],
    queryFn: () => getWebsiteInfo(connectedApp.client.id),
    placeholderData: {
      name: nameFromOrigin(connectedApp.client.origin),
      icon: '',
    },
    enabled: !!connectedApp.client.id,
  });

  const handleSelectApp = () => {
    setSelectedApp(connectedApp);
  };

  return (
    <Client key={connectedApp.client.id} onClick={handleSelectApp}>
      <ClientDescription>
        <AppIcon src={appDetails?.icon} />
        <ClientHeader>
          <ClientName>{nameFromOrigin(connectedApp.client.origin)}</ClientName>
          <ClientPermissions clientId={connectedApp.client.id} color={theme.colors.white_200} />
        </ClientHeader>
      </ClientDescription>
      <CaretRight size={16} color="white" />
    </Client>
  );
}
