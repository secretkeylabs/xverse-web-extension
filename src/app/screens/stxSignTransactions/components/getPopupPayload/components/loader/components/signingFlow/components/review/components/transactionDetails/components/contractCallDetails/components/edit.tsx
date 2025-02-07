import { PencilSimple } from '@phosphor-icons/react';
import type { ButtonHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { VerticalCenteringNoHeight } from '../../../styles';

const Container = styled.button(({ theme, disabled }) => ({
  ...theme.typography.body_medium_m,
  color: theme.colors.tangerine,
  backgroundColor: 'transparent',
  transition: 'color 0.1s ease',
  cursor: disabled ? 'default' : 'pointer',

  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  columnGap: theme.space.xxs,

  ':hover': {
    color: theme.colors.tangerine_200,
  },

  // https://github.com/whatwg/html/issues/8228
  userSelect: 'none',
}));

type Props = ButtonHTMLAttributes<HTMLButtonElement>;
export function EditButton(props: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Container {...props}>
      <span>{t('COMMON.EDIT')}</span>
      <VerticalCenteringNoHeight>
        <PencilSimple size={theme.space.m} weight="fill" />
      </VerticalCenteringNoHeight>
    </Container>
  );
}
