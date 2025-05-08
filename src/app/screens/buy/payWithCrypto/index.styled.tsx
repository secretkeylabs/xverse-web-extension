import FiatAmountText from '@components/fiatAmountText';
import styled from 'styled-components';
import { CryptoSheetSelectItemValues } from '../index.styled';

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: props.theme.space.xxl,
}));

export const SheetContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xs,
}));

export const AltOptText = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  padding: `0 ${props.theme.space.m}`,
}));

export const DividerContainer = styled.div((props) => ({
  padding: `0 ${props.theme.space.m}`,
}));

export const SheetItem = styled(CryptoSheetSelectItemValues)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexGrow: 1,
});

export const CryptoSheetStacksRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
});

export const StyledFiatText = styled(FiatAmountText)((props) => ({
  color: `${props.theme.colors.white_200} !important`,
}));

export const StxCryptoSheetItem = styled(CryptoSheetSelectItemValues)({
  span: {
    textAlign: 'right',
  },
});
