import { StyledFiatAmountText } from '@components/fiatAmountText';
import { StyledP } from '@ui-library/common.styled';
import styled from 'styled-components';

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: props.theme.space.m,
  paddingBottom: 20,
  marginBottom: props.theme.space.s,
}));

export const RecipientTitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xs,
}));

export const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'flex-start',
  marginTop: props.theme.space.m,
}));

export const Icon = styled.img((props) => ({
  marginRight: props.theme.space.m,
  width: 32,
  height: 32,
  borderRadius: 30,
}));

export const DownArrowIcon = styled.img((props) => ({
  width: 16,
  height: 16,
  marginTop: props.theme.space.xs,
  marginLeft: props.theme.space.xs,
  marginBottom: props.theme.space.xs,
}));

export const TitleContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
});

export const TitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

export const Subtitle = styled(StyledP)((props) => ({
  color: props.theme.colors.white_400,
  marginTop: props.theme.space.xxxs,
}));

export const ValueText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

export const SubValueText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.white_400,
}));

export const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
});

export const MultipleAddressContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const TokenContainer = styled.div((props) => ({
  marginRight: props.theme.space.m,
}));

export const IconContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 30,
  backgroundColor: props.theme.colors.elevation3,
  width: 32,
  height: 32,
  marginRight: props.theme.space.m,
}));

export const FiatText = styled(StyledFiatAmountText)((props) => ({
  marginTop: props.theme.space.xxxs,
}));

export const Title = styled.p`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_200};
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.xs};
`;
