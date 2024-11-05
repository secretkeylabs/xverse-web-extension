import styled from 'styled-components';

export const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: `0 ${props.theme.space.m}`,
}));

export const RequestType = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  marginTop: props.theme.space.s,
  color: props.theme.colors.white_0,
  textAlign: 'left',
  marginBottom: props.theme.space.l,
}));

export const MessageHash = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  lineHeight: 1.6,
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.xs,
}));

export const SigningAddressContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: `${props.theme.space.s} ${props.theme.space.m}`,
  marginBottom: props.theme.space.s,
  flex: 1,
}));

export const SigningAddressTitle = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  wordWrap: 'break-word',
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xs,
}));

export const SigningAddress = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const SigningAddressType = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.xs,
}));

export const SigningAddressValue = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.xs,
}));

export const ActionDisclaimer = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.space.xs,
  marginBottom: props.theme.space.m,
}));

export const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  padding: `0 ${props.theme.space.m}`,
  marginBottom: props.theme.space.xxl,
  marginTop: props.theme.space.xxl,
}));
