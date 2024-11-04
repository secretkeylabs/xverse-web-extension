import Button from '@ui-library/button';
import styled, { keyframes } from 'styled-components';
import { devices } from 'theme';

const slideYAndOpacity = keyframes`
    0% {
        opacity: 0;
        transform: translateY(49px);
      }
    100% {
        opacity: 1;
        transform: translateY(0);
      }
  `;

const slideY = keyframes`
    0% {
        transform: translateY(49px);
      }
    100% {
        transform: translateY(0);
      }
  `;

const slideOpacity = keyframes`
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
`;

const slideRightAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateX(240px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideLeftAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-240px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
  overflow: hidden;
`;

export const AppVersion = styled.p((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.white_0,
  textAlign: 'right',
  marginRight: props.theme.spacing(9),
  marginTop: props.theme.spacing(8),
  position: 'relative',
}));

export const ArrowContainer = styled.div`
  position: relative;
  top: 209px;
  margin-left: ${(props) => props.theme.space.s};
  margin-right: ${(props) => props.theme.space.s};
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  animation: ${() => slideOpacity} 0.2s ease-out;
  z-index: 1;
`;

export const CaretButton = styled.button<{ $disabled: boolean }>((props) => ({
  backgroundColor: 'transparent',
  cursor: props.$disabled ? 'default' : 'pointer',
  svg: {
    opacity: props.$disabled ? 0.6 : 1,
    transition: 'opacity 0.1s ease',
  },
  '&:hover:enabled, &:focus:enabled': {
    svg: {
      opacity: 0.8,
    },
  },
}));

export const AnimationContainer = styled.div({
  marginTop: '60%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [`@media ${devices.min.xs}`]: {
    marginTop: '35%',
  },
});

const LandingSectionContainer = styled.div({
  marginTop: '50%',
  marginBottom: '88px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [`@media ${devices.min.xs}`]: {
    marginTop: '30%',
  },
});

export const InitialTransitionLandingSectionContainer = styled(LandingSectionContainer)`
  animation: ${() => slideY} 0.2s ease-out;
`;

export const TransitionLandingSectionContainer = styled(LandingSectionContainer)<{
  $direction: 'left' | 'right';
}>((props) => ({
  animation: `${
    props.$direction === 'left' ? slideLeftAnimation : slideRightAnimation
  } 0.3s cubic-bezier(0, 0, 0.58, 1) forwards`,
}));

export const Logo = styled.img`
  width: 135px;
  height: 25px;
`;

export const LandingTitle = styled.h1`
  ${(props) => props.theme.typography.body_medium_l}
  margin-top: ${(props) => props.theme.space.m};
  color: ${(props) => props.theme.colors.white_200};
  text-align: center;
`;

const OnboardingContainer = styled.div((props) => ({
  marginBottom: props.theme.space.l,
}));

export const TransitionOnboardingContainer = styled(OnboardingContainer)<{
  $direction: 'left' | 'right';
}>((props) => ({
  animation: `${
    props.$direction === 'left' ? slideLeftAnimation : slideRightAnimation
  } 0.3s cubic-bezier(0, 0, 0.58, 1) forwards`,
}));

export const OnBoardingImage = styled.img(() => ({
  marginTop: -26,
  alignSelf: 'center',
  transform: 'all',
}));

export const OnBoardingContent = styled.div((props) => ({
  marginTop: props.theme.spacing(24),
  padding: `0 22px`,
}));

export const OnboardingTitle = styled.h1<{ needPadding: boolean }>((props) => ({
  ...props.theme.typography.headline_xs,
  textAlign: 'center',
  paddingLeft: props.needPadding ? 20 : 0,
  paddingRight: props.needPadding ? 20 : 0,
}));

export const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: ${(props) => props.theme.space.m};
  margin-right: ${(props) => props.theme.space.m};
  animation: ${() => slideYAndOpacity} 0.2s ease-out;
`;

export const CreateButton = styled(Button)((props) => ({
  marginTop: props.theme.space.l,
}));

export const RestoreButton = styled(Button)((props) => ({
  marginTop: props.theme.space.s,
}));
