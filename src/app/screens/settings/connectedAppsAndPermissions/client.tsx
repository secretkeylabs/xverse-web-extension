import { usePermissionsUtils } from '@components/permissionsManager';
import type { Client as ClientType } from '@components/permissionsManager/schemas';
import { CaretRight } from '@phosphor-icons/react';
import { getAppIconFromWebManifest } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'styled-components';
import type { ConnectedApp } from '.';
import {
  Client,
  ClientDescription,
  ClientHeader,
  ClientName,
  DappIcon,
  DappIconPlaceholder,
  PermissionContainer,
  PermissionText,
} from './index.styles';

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
  clientId: string;
  color?: string;
};
export function ClientPermissions({ clientId, color }: PermissionsProps) {
  const utils = usePermissionsUtils();
  const sortedPermissions = utils
    .getClientPermissions(clientId)
    .sort((p1, p2) => p1.resourceId.localeCompare(p2.resourceId));

  return sortedPermissions.map((p) => {
    const resource = utils.getResource(p.resourceId);
    if (!resource) return null;

    return (
      <PermissionContainer key={p.resourceId}>
        {[...p.actions].map((a) => (
          <PermissionText color={color} key={a}>
            {a}
          </PermissionText>
        ))}
      </PermissionContainer>
    );
  });
}

interface Props {
  client: ConnectedApp;
  setSelectedApp: (app: ConnectedApp) => void;
}

export default function ClientApp({ client, setSelectedApp }: Props) {
  const theme = useTheme();
  const { data: appDetails } = useQuery({
    queryKey: ['websiteInfo', client.id],
    queryFn: () => getWebsiteInfo(client.id),
    placeholderData: { name: client.name, icon: '' },
    enabled: !!client.id,
  });

  const handleSelectApp = () => {
    setSelectedApp({
      ...client,
      name: appDetails?.name || client.name,
    });
  };

  return (
    <Client key={client.id} onClick={handleSelectApp}>
      <ClientDescription>
        {appDetails?.icon ? (
          <DappIcon src={appDetails.icon} alt="Dapp logo" />
        ) : (
          <DappIconPlaceholder width={32} height={32} color="white" />
        )}
        <ClientHeader>
          <ClientName>{appDetails?.name}</ClientName>
          <ClientPermissions clientId={client.id} color={theme.colors.white_200} />
        </ClientHeader>
      </ClientDescription>
      <CaretRight size={16} color="white" />
    </Client>
  );
}
