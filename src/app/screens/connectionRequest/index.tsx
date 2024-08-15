/* eslint-disable import/prefer-default-export */
import { getPopupPayload, type Context } from '@common/utils/popup';
import { sendRequestPermissionsSuccessResponseMessage } from '@common/utils/rpc/responseMessages/wallet';
import { usePermissionsUtils } from '@components/permissionsManager';
import { makeAccountResource } from '@components/permissionsManager/resources';
import type { Client, Permission } from '@components/permissionsManager/schemas';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { requestPermissionsRequestMessageSchema } from '@sats-connect/core';
import Button from '@ui-library/button';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';
import { DappLogo } from './dapp-logo';
import { Host } from './host';
import {
  AccountSwitcherContainer,
  Container,
  ContentContainer,
  PermissionDescriptionsContainer,
} from './index.styles';
import * as Permissions from './permissions';
import { SelectAccountPrompt } from './select-account';
import { Title } from './title';

type ConnectionRequestInnerProps = {
  context: Context;
  data: v.InferOutput<typeof requestPermissionsRequestMessageSchema>;
};
function ConnectionRequestInner({ data, context }: ConnectionRequestInnerProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'AUTH_REQUEST_SCREEN' });
  const { network } = useWalletSelector();
  const account = useSelectedAccount();
  const { addClient, addResource, setPermission } = usePermissionsUtils();

  const handleCancel = useCallback(() => {
    window.close();
  }, []);

  const handleAccept = useCallback(async () => {
    const client: Client = {
      id: context.origin,
      name: context.origin,
      origin: context.origin,
    };

    const resource = makeAccountResource({
      accountId: account.id,
      networkType: network.type,
      masterPubKey: account.masterPubKey,
    });

    const permission: Permission = {
      clientId: client.id,
      resourceId: resource.id,
      actions: new Set(['read']),
    };

    await addClient(client);
    await addResource(resource);
    await setPermission(permission);

    sendRequestPermissionsSuccessResponseMessage({
      messageId: data.id,
      tabId: context.tabId,
      result: true,
    });

    window.close();
  }, [
    account.id,
    account.masterPubKey,
    addClient,
    addResource,
    context.origin,
    context.tabId,
    data.id,
    network.type,
    setPermission,
  ]);

  return (
    <Container>
      <ContentContainer>
        <DappLogo />
        <Title />
        <Host url={context.origin} />

        <AccountSwitcherContainer>
          <SelectAccountPrompt />
        </AccountSwitcherContainer>

        <PermissionDescriptionsContainer>
          <Permissions.Title />
          <Permissions.Description description={t('PERMISSION_WALLET_BALANCE')} />
          <Permissions.Description description={t('PERMISSION_REQUEST_TX')} />
          <Permissions.Description description={t('PERMISSION_WALLET_TYPE_ACCESS')} />
        </PermissionDescriptionsContainer>
      </ContentContainer>

      <StickyHorizontalSplitButtonContainer>
        <Button type="button" variant="secondary" onClick={handleCancel} title="Deny" />
        <Button type="button" onClick={handleAccept} title="Accept" />
      </StickyHorizontalSplitButtonContainer>
    </Container>
  );
}

export function ConnectionRequest() {
  const [error, data] = getPopupPayload((maybeData) =>
    v.parse(requestPermissionsRequestMessageSchema, maybeData),
  );

  if (error) {
    return <div>Error processing connection request.</div>;
  }

  return <ConnectionRequestInner data={data.data} context={data.context} />;
}
