import { BestBarLoader } from '@components/barLoader';
import FiatAmountText from '@components/fiatAmountText';
import styled from 'styled-components';

export const TileContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: props.color,
  width: '100%',
  padding: `${props.theme.space.m} 0`,
  borderRadius: props.theme.radius(2),
  alignItems: 'center',
}));

export const TokenImageContainer = styled.div((props) => ({
  display: 'flex',
  marginRight: props.theme.space.m,
}));

export const RowContainers = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
`;

export const RowContainer = styled.div((props) => ({
  display: 'flex',
  columnGap: props.theme.space.m,
}));

export const AmountContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const TokenTitle = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  lineHeight: '140%',
  minHeight: 20,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const TokenTicker = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  lineHeight: '140%',
  minHeight: 20,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const TokenTitleContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-start',
  overflow: 'hidden',
  marginBottom: props.theme.space.xxxs,
}));

export const StyledBarLoader = styled(BestBarLoader)<{
  $withMarginBottom?: boolean;
}>((props) => ({
  marginBottom: props.$withMarginBottom ? props.theme.space.xxxs : 0,
}));

export const StyledFiatAmountText = styled(FiatAmountText)`
  ${(props) => props.theme.typography.body_bold_m}
  color: ${(props) => props.theme.colors.white_0};
  line-height: 140%;
  min-height: 20px;
`;

export const FiatAmountContainer = styled.div`
  ${(props) => props.theme.typography.body_bold_m}
  color: ${(props) => props.theme.colors.white_0};
`;
