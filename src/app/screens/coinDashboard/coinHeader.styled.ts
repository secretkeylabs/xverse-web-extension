import styled from 'styled-components';

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
}));

export const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.xxs,
}));

export const ProtocolText = styled.p((props) => ({
  ...props.theme.headline_category_s,
  fontWeight: 700,
  height: 15,
  marginTop: props.theme.spacing(3),
  textTransform: 'uppercase',
  marginLeft: props.theme.space.xxs,
  backgroundColor: props.theme.colors.white_400,
  padding: '1px 6px 1px',
  color: props.theme.colors.elevation0,
  borderRadius: props.theme.radius(2),
}));

export const BalanceInfoContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const BalanceValuesContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const FiatContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'center',
});

export const CoinBalanceText = styled.p((props) => ({
  ...props.theme.typography.headline_l,
  fontSize: '1.5rem',
  color: props.theme.colors.white_0,
  textAlign: 'center',
  wordBreak: 'break-all',
  cursor: 'pointer',
  transition: 'color 0.1s ease',
  '&:hover': {
    color: props.theme.colors.white_200,
  },
}));

export const FiatAmountText = styled.p((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_200,
  fontSize: '0.875rem',
  textAlign: 'center',
  marginRight: props.theme.space.xxs,
  marginTop: props.theme.space.xxs,
  cursor: 'pointer',
}));

export const BalanceTitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

export const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: props.theme.space.ml,
  columnGap: props.theme.space.l,
}));

export const HeaderSeparator = styled.div((props) => ({
  border: `0.5px solid ${props.theme.colors.white_400}`,
  width: '50%',
  alignSelf: 'center',
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.m,
}));

export const StxLockedText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
}));

export const LockedStxContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  span: {
    color: props.theme.colors.white_400,
    marginRight: props.theme.spacing(3),
  },
  img: {
    marginRight: props.theme.spacing(3),
  },
}));

export const AvailableStxContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: props.theme.space.xs,
  span: {
    color: props.theme.colors.white_400,
    marginRight: props.theme.spacing(3),
  },
}));

export const VerifyOrViewContainer = styled.div((props) => ({
  margin: props.theme.space.m,
  marginTop: props.theme.space.xl,
  marginBottom: props.theme.space.xxl,
}));

export const VerifyButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.space.s,
}));

export const StacksLockedInfoText = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  textAlign: 'left',
}));

export const PriceStatsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.xs,
  height: props.theme.space.ml,
}));
