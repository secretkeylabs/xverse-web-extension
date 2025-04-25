/* eslint-disable import/prefer-default-export */
import BitcoinIcon from '@assets/img/dashboard/bitcoin_icon.svg';
import stxIcon from '@assets/img/dashboard/stx_icon.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { getPopupPayload, type Context } from '@common/utils/popup';
import {
  AddressPurpose,
  BitcoinNetworkType,
  connectRequestMessageSchema,
  requestPermissionsRequestMessageSchema,
  type ChangeNetworkRequestMessage,
  type ConnectRequestMessage,
  type RequestPermissionsRequestMessage,
} from '@sats-connect/core';
import Button from '@ui-library/button';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';
import { DappLogo } from './dappLogo';
import { useMakeHandleAccept } from './hooks';
import { Host } from './host';
import {
  AccountSwitcherContainer,
  AddressBoxContainer,
  Container,
  ContentContainer,
  DappInfoContainer,
  DappInfoTextContainer,
  PermissionDescriptionsContainer,
  RequestMessage,
} from './index.styles';

import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import ChangeNetworkRequestInner from '@screens/changeNetworkRequest/changeNetworkRequestInner';
import { getAppIconFromWebManifest, safePromise } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import AddressPurposeBox from '../addressPurposeBox';
import * as Permissions from './permissions';
import { SelectAccountPrompt } from './selectAccount';
import { Title } from './title';

type ConnectionRequestInnerProps = {
  context: Context;
  data: ConnectRequestMessage | RequestPermissionsRequestMessage;
};
function ConnectionRequestInner({ data, context }: ConnectionRequestInnerProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'AUTH_REQUEST_SCREEN' });
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const [networkChanged, setNetworkChanged] = useState(false);

  const desiredNetwork = (data as ConnectRequestMessage).params?.network;
  const networkMismatch = desiredNetwork && desiredNetwork !== network.type;

  const changeNetworkRequest: ChangeNetworkRequestMessage = {
    method: 'wallet_changeNetwork',
    params: {
      name: desiredNetwork as BitcoinNetworkType,
    },
    id: data.id,
    jsonrpc: data.jsonrpc,
  };

  const handleCancel = useCallback(() => {
    window.close();
  }, []);
  const handleAccept = useMakeHandleAccept({ context, data });

  const { data: appIconSrc } = useQuery({
    queryKey: ['appIcon', context.origin],
    queryFn: async () => {
      const [error, icon] = await safePromise(getAppIconFromWebManifest(context.origin));

      if (error) return null;

      return icon;
    },
  });

  const AddressPurposeRow = useCallback(
    (purpose: AddressPurpose) => {
      if (purpose === AddressPurpose.Payment) {
        return (
          <AddressPurposeBox
            key={purpose}
            purpose={purpose}
            icon={BitcoinIcon}
            title={t('BITCOIN_ADDRESS')}
            address={selectedAccount.btcAddress}
          />
        );
      }
      if (purpose === AddressPurpose.Ordinals) {
        return (
          <AddressPurposeBox
            key={purpose}
            purpose={purpose}
            icon={OrdinalsIcon}
            title={t('ORDINAL_ADDRESS')}
            address={selectedAccount.ordinalsAddress}
          />
        );
      }
      if (purpose === AddressPurpose.Stacks) {
        return (
          <AddressPurposeBox
            key={purpose}
            purpose={purpose}
            icon={stxIcon}
            title={t('STX_ADDRESS')}
            address={selectedAccount.stxAddress}
            bnsName={selectedAccount.bnsName}
          />
        );
      }
    },
    [selectedAccount, t],
  );

  if (networkMismatch && !networkChanged) {
    return (
      <ChangeNetworkRequestInner
        context={context}
        data={changeNetworkRequest}
        onNetworkChange={() => {
          setNetworkChanged(true);
        }}
      />
    );
  }

  return (
    <Container>
      <ContentContainer>
        <DappInfoContainer>
          <DappLogo src={appIconSrc} />
          <DappInfoTextContainer>
            <Title />
            <Host origin={context.origin} />
            {(data as ConnectRequestMessage).params?.message && (
              <RequestMessage>
                {(data as ConnectRequestMessage).params?.message?.substring(0, 80)}
              </RequestMessage>
            )}
          </DappInfoTextContainer>
        </DappInfoContainer>
        <AccountSwitcherContainer>
          <SelectAccountPrompt />
        </AccountSwitcherContainer>
        {data.method === 'wallet_connect' && (
          <AddressBoxContainer>
            {(
              (data as ConnectRequestMessage).params?.addresses ?? [
                AddressPurpose.Payment,
                AddressPurpose.Ordinals,
                AddressPurpose.Stacks,
              ]
            ).map(AddressPurposeRow)}
          </AddressBoxContainer>
        )}
        {
          // Note: The description of the requested permissions is hard-coded
          // below given the wallet can currently only process "account read"
          // requests. The @secretkeylabs/xverse-core package already contains
          // utils for defining permission descriptions which would need to be
          // set up and iterated over for incomming requests when additional
          // types of permissions be supported.
        }
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
  // Requests to `"wallet_connect"` are for granting read permissions to the
  // current account. Requests to `"wallet_requestPermissions"` allow requesting
  // arbitrary permissions, and defaults to granting read permissions to the
  // current account when the request payload is empty.
  //
  // Although both `"wallet_connect"` and `"wallet_getPermissions"` allow
  // requesting arbitrary permissions, this feature is not yet implemented. For
  // the time being, any granular permissions requested using these methods are
  // ignored and only account read permissions may be granted.
  const [, permsRequestPayload] = getPopupPayload(v.parser(requestPermissionsRequestMessageSchema));
  const [, connectRequestPayload] = getPopupPayload(v.parser(connectRequestMessageSchema));

  const payload = permsRequestPayload ?? connectRequestPayload;

  if (!payload) {
    return <div>Error processing connection request.</div>;
  }

  return <ConnectionRequestInner data={payload.data} context={payload.context} />;
}
