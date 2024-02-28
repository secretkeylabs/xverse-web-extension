import animationData from '@assets/animation/full_logo_horizontal.json';
import logo from '@assets/img/full_logo_horizontal.svg';
import onboarding1 from '@assets/img/landing/onboarding1.svg';
import onboarding2 from '@assets/img/landing/onboarding2.svg';
import Steps from '@components/steps';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { getIsTermsAccepted } from '@utils/localStorage';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'react-lottie';
import styled, { keyframes, useTheme } from 'styled-components';

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
`;

const AppVersion = styled.p((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.white_0,
  textAlign: 'right',
  marginRight: props.theme.spacing(9),
  marginTop: props.theme.spacing(8),
  position: 'relative',
}));

const ArrowContainer = styled.div`
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

const StyledCaretLeft = styled(CaretLeft)<{ disabled: boolean }>((props) => ({
  opacity: props.disabled ? '60%' : '100%',
  cursor: props.disabled ? 'default' : 'pointer',
}));

const StyledCaretRight = styled(CaretRight)<{ disabled: boolean }>((props) => ({
  opacity: props.disabled ? '60%' : '100%',
  cursor: props.disabled ? 'default' : 'pointer',
}));

const AnimationContainer = styled.div({
  marginTop: '60%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const LandingSectionContainer = styled.div({
  marginTop: '50%',
  marginBottom: '88px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const InitialTransitionLandingSectionContainer = styled(LandingSectionContainer)`
  animation: ${() => slideY} 0.2s ease-out;
`;

const TransitionLeftLandingSectionContainer = styled(LandingSectionContainer)`
  animation: ${slideLeftAnimation} 0.3s cubic-bezier(0, 0, 0.58, 1) forwards;
`;

const TransitionRightLandingSectionContainer = styled(LandingSectionContainer)`
  animation: ${() => slideRightAnimation} 0.3s cubic-bezier(0, 0, 0.58, 1) forwards;
`;

const Logo = styled.img`
  width: 135px;
  height: 25px;
`;

const LandingTitle = styled.h1`
  ${(props) => props.theme.typography.body_medium_l}
  margin-top: 17px;
  color: ${(props) => props.theme.colors.white_200};
  text-align: center;
`;

const OnboardingContainer = styled.div((props) => ({
  marginBottom: props.theme.space.l,
}));

const TransitionLeftOnboardingContainer = styled(OnboardingContainer)`
  animation: ${() => slideLeftAnimation} 0.3s cubic-bezier(0, 0, 0.58, 1) forwards;
`;

const TransitionRightOnboardingContainer = styled(OnboardingContainer)`
  animation: ${() => slideRightAnimation} 0.3s cubic-bezier(0, 0, 0.58, 1) forwards;
`;

const OnBoardingImage = styled.img(() => ({
  marginTop: -25,
  alignSelf: 'center',
  transform: 'all',
}));

const OnBoardingContent = styled.div((props) => ({
  marginTop: props.theme.spacing(24),
  marginLeft: props.theme.space.l,
  marginRight: props.theme.space.l,
}));

const OnboardingTitle = styled.h1<{ needPadding: boolean }>((props) => ({
  ...props.theme.typography.headline_xs,
  textAlign: 'center',
  paddingLeft: props.needPadding ? 20 : 0,
  paddingRight: props.needPadding ? 20 : 0,
}));

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: ${(props) => props.theme.space.m};
  margin-right: ${(props) => props.theme.space.m};
  animation: ${() => slideYAndOpacity} 0.2s ease-out;
`;

const CreateButton = styled.button((props) => ({
  display: 'flex',
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.elevation0,
  textAlign: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  marginTop: props.theme.space.l,
  width: '100%',
  height: 44,
  ':hover': {
    background: props.theme.colors.action.classicLight,
  },
  ':focus': {
    background: props.theme.colors.action.classicLight,
    opacity: 0.6,
  },
}));

const RestoreButton = styled.button((props) => ({
  display: 'flex',
  marginTop: props.theme.space.s,
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.elevation0,
  border: `0.5px solid ${props.theme.colors.elevation2}`,
  width: '100%',
  height: 44,
  ':hover': {
    background: props.theme.colors.elevation6_800,
  },
  ':focus': {
    background: props.theme.colors.action.classic800,
  },
}));

function Landing() {
  const { t } = useTranslation('translation', { keyPrefix: 'LANDING_SCREEN' });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [slideTransitions, setSlideTransitions] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');

  const theme = useTheme();
  const onboardingViews = [
    {
      image: logo,
      title: t('SCREEN_TITLE'),
    },
    {
      image: onboarding1,
      title: t('ONBOARDING_1_TITlE'),
    },
    {
      image: onboarding2,
      title: t('ONBOARDING_2_TITlE'),
    },
  ];

  const proceedToWallet = useCallback(async (isRestore?: boolean) => {
    const isLegalAccepted = getIsTermsAccepted();
    if (isLegalAccepted) {
      if (isRestore) {
        await chrome.tabs.create({
          url: chrome.runtime.getURL(`options.html#/restoreWallet`),
        });
      } else {
        await chrome.tabs.create({
          url: chrome.runtime.getURL(`options.html#/backup`),
        });
      }
    } else {
      const params = isRestore ? '?restore=true' : '';
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#/legal${params}`),
      });
    }
  }, []);

  const renderLandingSection = () => (
    <>
      <Logo src={onboardingViews[0].image} alt="logo" />
      <LandingTitle>{onboardingViews[0].title}</LandingTitle>
    </>
  );

  const renderOnboardingContent = (index: number) => (
    <Container>
      <OnBoardingImage src={onboardingViews[index].image} alt="onboarding" height={233} />
      <OnBoardingContent>
        <OnboardingTitle needPadding={index === 2}>{onboardingViews[index].title}</OnboardingTitle>
      </OnBoardingContent>
    </Container>
  );

  const handleClickNext = () => {
    if (currentStepIndex < onboardingViews.length - 1) {
      setSlideTransitions(true);
      setCurrentStepIndex((curStepIndex) => curStepIndex + 1);
      setTransitionDirection('right');
    }
  };

  const handleClickBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((curStepIndex) => curStepIndex - 1);
      setTransitionDirection('left');
    }
  };

  const renderTransitions = () => {
    if (slideTransitions) {
      switch (currentStepIndex) {
        case 0:
          return transitionDirection === 'left' ? (
            <TransitionLeftLandingSectionContainer key={currentStepIndex}>
              {renderLandingSection()}
            </TransitionLeftLandingSectionContainer>
          ) : (
            <TransitionRightLandingSectionContainer key={currentStepIndex}>
              {renderLandingSection()}
            </TransitionRightLandingSectionContainer>
          );
        default:
          return transitionDirection === 'left' ? (
            <TransitionLeftOnboardingContainer key={currentStepIndex}>
              {renderOnboardingContent(currentStepIndex)}
            </TransitionLeftOnboardingContainer>
          ) : (
            <TransitionRightOnboardingContainer key={currentStepIndex}>
              {renderOnboardingContent(currentStepIndex)}
            </TransitionRightOnboardingContainer>
          );
      }
    } else {
      return (
        <InitialTransitionLandingSectionContainer>
          <Logo src={onboardingViews[0].image} alt="logo" />
          <LandingTitle>{onboardingViews[0].title}</LandingTitle>
        </InitialTransitionLandingSectionContainer>
      );
    }
  };

  return (
    <Container>
      <AppVersion>Beta</AppVersion>
      {animationComplete ? (
        <Container>
          <ArrowContainer>
            <StyledCaretLeft
              disabled={currentStepIndex <= 0}
              onClick={handleClickBack}
              size={theme.space.l}
              color={theme.colors.white_0}
              opacity={currentStepIndex > 0 ? '100%' : '60%'}
            />
            <StyledCaretRight
              disabled={currentStepIndex >= onboardingViews.length - 1}
              onClick={handleClickNext}
              size={theme.space.l}
              color={theme.colors.white_0}
              opacity={currentStepIndex < onboardingViews.length - 1 ? '100%' : '60%'}
            />
          </ArrowContainer>
          {renderTransitions()}
          <BottomContainer>
            <Steps data={onboardingViews} activeIndex={currentStepIndex} dotStrategy="selection" />
            <CreateButton onClick={() => proceedToWallet()}>
              {t('CREATE_WALLET_BUTTON')}
            </CreateButton>
            <RestoreButton onClick={() => proceedToWallet(true)}>
              {t('RESTORE_WALLET_BUTTON')}
            </RestoreButton>
          </BottomContainer>
        </Container>
      ) : (
        <AnimationContainer>
          <Lottie
            options={{ loop: false, animationData }}
            width="70%"
            eventListeners={[
              {
                eventName: 'complete',
                callback: () => setTimeout(() => setAnimationComplete(true), 1000),
              },
            ]}
          />
        </AnimationContainer>
      )}
    </Container>
  );
}

export default Landing;
