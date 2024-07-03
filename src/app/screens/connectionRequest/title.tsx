/* eslint-disable import/prefer-default-export */
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const TitleInner = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

export function Title() {
  const { t } = useTranslation('translation', { keyPrefix: 'AUTH_REQUEST_SCREEN' });
  return <TitleInner>{t('TITLE')}</TitleInner>;
}
