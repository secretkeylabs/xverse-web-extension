import { animated } from '@react-spring/web';
import styled from 'styled-components';

export const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

export const HeaderText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_l,
  textAlign: 'center',
  marginTop: props.theme.spacing(15),
}));

export const HeaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const PasswordInputLabel = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  marginTop: props.theme.spacing(24),
  marginBottom: props.theme.space.xs,
  textAlign: 'left',
}));

export const ButtonsContainer = styled.div<{
  $stackButtonAlignment: boolean;
  $ifError: boolean;
}>((props) => ({
  display: 'flex',
  flexDirection: props.$stackButtonAlignment ? 'column-reverse' : 'row',
  alignItems: props.$stackButtonAlignment ? 'center' : 'flex-end',
  flex: 1,
  marginTop: props.$ifError ? props.theme.space.xxxl : props.theme.space.xxxxl,
  marginBottom: props.theme.space.m,
}));

export const StyledButton = styled.button({
  background: 'none',
  display: 'flex',
  transition: 'opacity 0.1s ease',
  '&:hover, &:focus': {
    opacity: 0.8,
  },
});

export const PasswordStrengthContainer = styled.div<{ $visibility: boolean }>((props) => ({
  ...props.theme.typography.body_medium_m,
  visibility: props.$visibility ? 'visible' : 'hidden',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginTop: props.theme.space.m,
  span: {
    opacity: 0.6,
  },
  p: {
    justifySelf: 'flex-end',
  },
}));

export const StrengthBar = styled(animated.div)<{
  $strengthColor: string;
  $strengthWidth: string;
}>((props) => ({
  display: 'flex',
  flex: '1 0',
  alignItems: 'center',
  backgroundColor: props.theme.colors.white_600,
  marginLeft: props.theme.spacing(6),
  marginRight: props.theme.spacing(9),
  borderRadius: props.theme.radius(1),
  width: '50%',
  div: {
    width: props.$strengthWidth,
    height: 4,
    backgroundColor: props.$strengthColor,
    borderRadius: props.theme.radius(1),
  },
}));

export const ButtonContainer = styled.div<{
  $stackButtonAlignment: boolean;
}>((props) => ({
  marginLeft: props.$stackButtonAlignment ? 0 : 3,
  marginRight: props.$stackButtonAlignment ? 0 : 3,
  marginTop: props.theme.space.xs,
  width: '100%',
}));
