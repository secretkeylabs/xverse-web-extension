import { animated } from '@react-spring/web';
import styled from 'styled-components';

export const Logo = styled.img({
  width: 57,
  height: 57,
});

export const IconButton = styled.button({
  background: 'none',
});

export const ScreenContainer = styled(animated.div)((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: props.theme.spacing(9),
  paddingRight: props.theme.spacing(9),
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

export const ContentContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

export const AppVersion = styled.p((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.white_0,
  textAlign: 'right',
  marginTop: props.theme.space.m,
}));

export const TopSectionContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(60),
  marginBottom: props.theme.spacing(30),
}));

export const PasswordInputLabel = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  marginTop: props.theme.spacing(15.5),
}));

export const PasswordInputContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  border: `1px solid ${props.theme.colors.elevation3}`,
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  borderRadius: props.theme.radius(1),
  marginTop: props.theme.space.xs,
}));

export const PasswordInput = styled.input((props) => ({
  ...props.theme.typography.body_medium_m,
  height: 44,
  backgroundColor: props.theme.colors.elevation0,
  color: props.theme.colors.white_0,
  width: '100%',
  border: 'none',
}));

export const LandingTitle = styled.h1((props) => ({
  ...props.theme.tile_text,
  paddingTop: props.theme.spacing(15),
  paddingLeft: props.theme.spacing(34),
  paddingRight: props.theme.spacing(34),
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

export const ButtonContainer = styled.div((props) => ({
  marginTop: props.theme.space.m,
  width: '100%',
}));

export const ErrorMessage = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.danger_medium,
  marginTop: props.theme.space.xs,
}));

export const ForgotPasswordButton = styled.button((props) => ({
  ...props.theme.typography.body_m,
  textAlign: 'center',
  marginTop: props.theme.space.l,
  color: props.theme.colors.white_0,
  textDecoration: 'underline',
  backgroundColor: 'transparent',
  ':hover': {
    textDecoration: 'none',
  },
}));
