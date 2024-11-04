import { Check } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

const TitleInner = styled('div')((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
}));
export function Title() {
  const { t } = useTranslation('translation', { keyPrefix: 'AUTH_REQUEST_SCREEN' });
  return <TitleInner>{t('PERMISSIONS_TITLE')}</TitleInner>;
}

const DescriptionContainer = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  marginTop: 12,
  display: 'flex',
  alignItems: 'center',
}));
const IconContainer = styled.div((props) => ({
  display: 'flex',
  paddingInlineEnd: props.theme.space.xs,
}));
export function Description({ description }: { description: string }) {
  const theme = useTheme();
  return (
    <DescriptionContainer>
      <IconContainer>
        <Check size={theme.space.m} color={theme.colors.success_light} weight="bold" />
      </IconContainer>
      {description}
    </DescriptionContainer>
  );
}
