import styled from 'styled-components';

export const OuterContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const InnerContainer = styled.div((props) => ({
  flex: 1,
  ...props.theme.scrollbar,
}));

export const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
}));

export const RequestType = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(11),
  color: props.theme.colors.white_0,
  textAlign: 'left',
  marginBottom: props.theme.spacing(4),
}));

export const RequestSource = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_400,
  textAlign: 'left',
  marginBottom: props.theme.spacing(12),
}));

export const MessageHash = styled.p((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  lineHeight: 1.6,
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

export const SigningAddressContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  marginBottom: props.theme.spacing(6),
  flex: 1,
}));

export const SigningAddressTitle = styled.p((props) => ({
  ...props.theme.body_medium_m,
  wordWrap: 'break-word',
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(4),
}));

export const SigningAddress = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const SigningAddressType = styled.p((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

export const SigningAddressValue = styled.p((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

export const ActionDisclaimer = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(8),
}));

export const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(20),
}));
