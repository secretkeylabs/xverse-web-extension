import { animated } from '@react-spring/web';
import { StyledP } from '@ui-library/common.styled';
import styled from 'styled-components';

export const Logo = styled.img({
  width: 140,
  height: 26,
});

export const StyledButton = styled.button({
  background: 'none',
  display: 'flex',
  transition: 'opacity 0.1s ease',
  '&:hover': {
    opacity: 0.8,
  },
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
  marginTop: 142,
  marginBottom: props.theme.space.xxl,
}));

export const LandingTitle = styled(StyledP)((props) => ({
  marginTop: props.theme.space.m,
}));

export const ButtonContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
  width: '100%',
}));

export const ForgotPasswordButton = styled.button((props) => ({
  ...props.theme.typography.body_m,
  width: '100%',
  textAlign: 'center',
  marginTop: props.theme.space.l,
  color: props.theme.colors.white_200,
  textDecoration: 'underline',
  backgroundColor: 'transparent',
  ':hover': {
    textDecoration: 'none',
  },
}));
