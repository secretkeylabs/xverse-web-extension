import Sheet from '@ui-library/sheet';
import styled from 'styled-components';

export const SheetSelect = styled(Sheet)({
  '.body-container': {
    margin: 0,
    padding: 0,
    scrollbarGutter: 'unset',
  },
});

export const SheetSelectItem = styled.li((props) => ({
  ...props.theme.typography.body_medium_m,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: props.theme.space.m,
  cursor: 'pointer',
  transition: 'background-color 0.1s ease',
  '&:hover': {
    backgroundColor: props.theme.colors.white_950,
  },
  '&:active': {
    backgroundColor: props.theme.colors.white_900,
  },
}));

export const CryptoSheetSelectItem = styled.div((props) => ({
  display: 'flex',
  gap: props.theme.space.s,
  width: '100%',
}));

export const CryptoSheetSelectItemValues = styled.div<{ $wrap?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  'span:nth-of-type(1)': {
    ...props.theme.typography.body_bold_m,
    color: props.theme.colors.white_0,
    ...(props.$wrap && {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      maxWidth: '140px',
      whiteSpace: 'nowrap',
    }),
  },
  'span:nth-of-type(2)': {
    ...props.theme.typography.body_medium_m,
    color: props.theme.colors.white_200,
  },
}));

export const PaymentMethodChips = styled.div((props) => ({
  display: 'flex',
  gap: props.theme.space.s,
}));

export const ActionCardContent = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
});

export const ActionCardText = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
}));

export const ActionCardValue = styled.div((props) => ({
  display: 'flex',
  gap: props.theme.space.xs,
  alignItems: 'center',
}));

export const PaymentMethodImg = styled.img<{ $size?: number; $backgroundTransparent?: boolean }>(
  (props) => ({
    padding: props.theme.space.xxs,
    borderRadius: 100,
    backgroundColor: props.$backgroundTransparent
      ? props.theme.colors.transparent
      : props.theme.colors.white_0,
    width: props.$size ?? 40,
  }),
);

export const Chip = styled.div<{ $color?: 'green' | 'grey' }>((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.$color === 'grey' ? props.theme.colors.white_0 : props.theme.colors.success_light,
  backgroundColor:
    props.$color === 'grey' ? props.theme.colors.white_900 : props.theme.colors.success_dark_600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: `${props.theme.space.xxxs} ${props.theme.space.xs}`,
  borderRadius: props.theme.radius(0.5),
  whiteSpace: 'nowrap',
}));

export const SelectedContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
});
