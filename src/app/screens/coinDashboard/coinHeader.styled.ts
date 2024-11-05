import styled from 'styled-components';

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

export const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

export const ProtocolText = styled.p((props) => ({
  ...props.theme.headline_category_s,
  fontWeight: 700,
  height: 15,
  marginTop: props.theme.spacing(3),
  textTransform: 'uppercase',
  marginLeft: props.theme.spacing(2),
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

export const CoinBalanceText = styled.p((props) => ({
  ...props.theme.typography.headline_l,
  fontSize: '1.5rem',
  color: props.theme.colors.white_0,
  textAlign: 'center',
  wordBreak: 'break-all',
  cursor: 'pointer',
}));

export const FiatAmountText = styled.p((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_200,
  fontSize: '0.875rem',
  marginTop: props.theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
}));

export const BalanceTitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
  marginTop: props.theme.spacing(4),
}));

export const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: props.theme.spacing(11),
  columnGap: props.theme.space.l,
}));

export const HeaderSeparator = styled.div((props) => ({
  border: `0.5px solid ${props.theme.colors.white_400}`,
  width: '50%',
  alignSelf: 'center',
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(8),
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
  marginTop: props.theme.spacing(4),
  span: {
    color: props.theme.colors.white_400,
    marginRight: props.theme.spacing(3),
  },
}));

export const VerifyOrViewContainer = styled.div((props) => ({
  margin: props.theme.spacing(8),
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(20),
}));

export const VerifyButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(6),
}));

export const StacksLockedInfoText = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  textAlign: 'left',
}));
