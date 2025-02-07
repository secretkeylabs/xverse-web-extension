import { permissions } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';

/* eslint-disable import/prefer-default-export */
const Container = styled('div')((props) => ({
  color: props.theme.colors.white_400,
  ...props.theme.typography.body_medium_m,
  textAlign: 'center',
}));

type Props = {
  origin: string;
};

export function Host({ origin }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'AUTH_REQUEST_SCREEN' });

  const { nameFromOrigin } = permissions.utils.originName;
  const name = nameFromOrigin(origin);

  const dappName = (() => {
    // This means there was no name found for the origin, and the host is used
    // as the name instead.
    if (name === origin) {
      const parsedUrl = new URL(origin);
      return parsedUrl.host;
    }

    return name;
  })();

  return (
    <Container>
      {t('REQUEST_TOOLTIP')} {dappName}
    </Container>
  );
}
