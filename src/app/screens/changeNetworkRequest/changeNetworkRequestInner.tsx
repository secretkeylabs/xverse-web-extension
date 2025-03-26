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
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { Link, LinkBreak } from '@phosphor-icons/react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import {
  getAppIconFromWebManifest,
  initialNetworksList,
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
  const { t } = useTranslation('translation', { keyPrefix: 'CHANGE_NETWORK_REQUEST' });
  const { changeNetwork } = useWalletReducer();
  const { data: appIconSrc } = useQuery({
    queryKey: ['appIcon', context.origin],
    queryFn: async () => {
      const [error, icon] = await safePromise(getAppIconFromWebManifest(context.origin));

      if (error) return null;

      return icon;
    },
  });

  const handleAccept = async () => {
    const toNetwork = initialNetworksList.filter((n) => n.type === data.params?.name);
    await changeNetwork(toNetwork[0]);
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
