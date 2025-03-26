import { animated } from '@react-spring/web';
import styled from 'styled-components';

export const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

export const Wrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

export const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
}));

export const Description = styled.p((props) => ({
  ...props.theme.typography.body_l,
  marginTop: props.theme.space.m,
  color: props.theme.colors.white_200,
}));

export const PasswordInputLabel = styled.label((props) => ({
  ...props.theme.typography.body_medium_m,
  marginTop: props.theme.space.xl,
  marginBottom: props.theme.space.xs,
  color: props.theme.colors.white_200,
}));

export const ButtonContainer = styled.div<{
  $ifError: boolean;
}>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: props.theme.space.xxxl,
  marginBottom: props.theme.space.xxxl,
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
  marginBottom: props.theme.space.xs,
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
