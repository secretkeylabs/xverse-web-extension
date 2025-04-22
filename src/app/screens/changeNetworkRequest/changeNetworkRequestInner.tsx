import type { Context } from '@common/utils/popup';
import type { ChangeNetworkRequestMessage } from '@sats-connect/core';
import { DappLogo } from '@screens/connect/connectionRequest/dappLogo';
import { Host } from '@screens/connect/connectionRequest/host';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  ContentContainer,
  DappInfoTextContainer,
  InfoMessage,
  NetworkChangeContainer,
  Pill,
  PillLabel,
  Title,
} from './index.styles';

import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import { sendChangeNetworkSuccessResponseMessage } from '@common/utils/rpc/responseMessages/wallet';
import { usePermissions } from '@components/permissionsManager';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { Link, LinkBreak } from '@phosphor-icons/react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import {
  error,
  getAppIconFromWebManifest,
  initialNetworksList,
  permissions,
  type Permissions,
  safePromise,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import Theme from 'theme';

type ChangeNetworkRequestInnerProps = {
  context: Context;
  data: ChangeNetworkRequestMessage;
};

function ChangeNetworkRequestInner({ context, data }: ChangeNetworkRequestInnerProps) {
  const { network } = useWalletSelector();
  const { setPermission, getClientPermissions, addResource } = usePermissions();
  const currentAccount = useSelectedAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'CHANGE_NETWORK_REQUEST' });
  const { changeNetwork } = useWalletReducer();
  const { data: appIconSrc } = useQuery({
    queryKey: ['appIcon', context.origin],
    queryFn: async () => {
      const [iconError, icon] = await safePromise(getAppIconFromWebManifest(context.origin));

      if (iconError) return null;

      return icon;
    },
  });

  const isAccountPermission = (
    permission: Permissions.Store.Permission,
  ): permission is Permissions.Resources.Account.AccountPermission => permission.type === 'account';

  const handleAccept = async () => {
    const toNetwork = initialNetworksList.find((n) => n.type === data.params?.name);

    if (!toNetwork) {
      return error({
        name: 'NetworkError',
        message: 'No Network specified',
      });
    }

    const [clientIdError, clientId] = permissions.utils.store.makeClientId({
      origin: context.origin,
    });

    if (clientIdError) {
      return error({
        name: 'ClientIdError',
        message: 'Failed to create client ID during permissions check.',
      });
    }

    const currentAccountId = permissions.utils.account.makeAccountId({
      accountId: currentAccount.id,
      networkType: network.type,
      masterPubKey: currentAccount.masterPubKey,
    });

    const currentResourceId = permissions.resources.account.makeAccountResourceId(currentAccountId);

    const targetAccountId = permissions.utils.account.makeAccountId({
      accountId: 0,
      networkType: toNetwork.type,
      masterPubKey: currentAccount.masterPubKey,
    });

    const targetResource = permissions.resources.account.makeAccountResource({
      accountId: targetAccountId,
      masterPubKey: currentAccount.masterPubKey,
      networkType: toNetwork.type,
    });

    const clientPermissions = getClientPermissions(clientId);

    const currentAccountPermissions = clientPermissions.find(
      (permission) => permission.resourceId === currentResourceId,
    );

    if (!currentAccountPermissions) {
      return error({
        name: 'ClientPermissionsError',
        message: 'No Client Permissions Found',
      });
    }

    if (!isAccountPermission(currentAccountPermissions)) {
      return error({
        name: 'ClientPermissionsError',
        message: 'Permission type invalid',
      });
    }

    const targetAccountPermissions = clientPermissions.find(
      (permission) => permission.resourceId === targetResource.id,
    );

    if (!targetAccountPermissions) {
      addResource(targetResource);
      const targetPermission: Permissions.Store.Permission = {
        type: 'account',
        clientId,
        resourceId: targetResource.id,
        actions: currentAccountPermissions.actions,
      };
      setPermission(targetPermission);
    } else if (isAccountPermission(targetAccountPermissions)) {
      setPermission({
        ...targetAccountPermissions,
        actions: {
          ...currentAccountPermissions.actions,
          ...targetAccountPermissions.actions,
        },
      });
    }

    await changeNetwork(toNetwork);
    sendChangeNetworkSuccessResponseMessage({
      tabId: context.tabId,
      messageId: data.id,
    });
    window.close();
  };
  const handleCancel = () => {
    sendUserRejectionMessage({
      tabId: context.tabId,
      messageId: data.id,
    });
    window.close();
  };

  return (
    <Container>
      <ContentContainer>
        <DappLogo src={appIconSrc} />
        <DappInfoTextContainer>
          <Title>{t('TITLE')} </Title>
          <Host origin={context.origin} />
        </DappInfoTextContainer>
        <InfoMessage>{t('INFO_MESSAGE')}</InfoMessage>
        <NetworkChangeContainer>
          <Pill>
            <LinkBreak size={20} />
            <PillLabel>{network.type}</PillLabel>
          </Pill>
          <ArrowRight size={16} />
          <Pill color={Theme.colors.tangerine}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link size={20} />
            <PillLabel color={Theme.colors.tangerine}>{data.params?.name}</PillLabel>
          </Pill>
        </NetworkChangeContainer>
      </ContentContainer>
      <Callout bodyText={t('CALLOUT')} />
      <StickyHorizontalSplitButtonContainer>
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          title={t('CANCEL_BUTTON')}
        />
        <Button type="button" onClick={handleAccept} title={t('SWITCH_NETWORK_BUTTON')} />
      </StickyHorizontalSplitButtonContainer>
    </Container>
  );
}

export default ChangeNetworkRequestInner;
