import animationData from '@assets/animation/full_logo_horizontal.json';
import logo from '@assets/img/full_logo_horizontal.svg';
import onboarding1 from '@assets/img/landing/onboarding1.svg';
import onboarding2 from '@assets/img/landing/onboarding2.svg';
import Dots from '@components/dots';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import Button from '@ui-library/button';
import { isInOptions } from '@utils/helper';
import { getIsTermsAccepted } from '@utils/localStorage';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'react-lottie';
import { useNavigate } from 'react-router-dom';
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
  overflow: hidden;
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

const CaretButton = styled.button<{ disabled: boolean }>((props) => ({
  backgroundColor: 'transparent',
  cursor: props.disabled ? 'default' : 'pointer',
  svg: {
    opacity: props.disabled ? 0.6 : 1,
    transition: 'opacity 0.1s ease',
  },
  '&:hover:enabled, &:focus:enabled': {
    svg: {
      opacity: 0.8,
    },
  },
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
  margin-top: ${(props) => props.theme.space.m};
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
  marginTop: -26,
  alignSelf: 'center',
  transform: 'all',
}));

const OnBoardingContent = styled.div((props) => ({
  marginTop: props.theme.spacing(24),
  padding: `0 22px`,
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

const CreateButton = styled(Button)((props) => ({
  marginTop: props.theme.space.l,
}));

const RestoreButton = styled(Button)((props) => ({
  marginTop: props.theme.space.s,
}));

function Landing() {
  const { t } = useTranslation('translation', { keyPrefix: 'LANDING_SCREEN' });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [slideTransitions, setSlideTransitions] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');
  const navigate = useNavigate();

  const theme = useTheme();
  const onboardingViews = [
    {
      image: logo,
      title: t('SCREEN_TITLE'),
    },
    {
      image: onboarding1,
      title: t('ONBOARDING_1_TITLE'),
    },
    {
      image: onboarding2,
      title: t('ONBOARDING_2_TITLE'),
    },
  ];

  const proceedToWallet = useCallback(
    async (isRestore?: boolean) => {
      const isLegalAccepted = getIsTermsAccepted();

      if (isInOptions()) {
        if (isLegalAccepted) {
          if (isRestore) {
            navigate(`/restoreWallet`);
          } else {
            navigate(`/backup`);
          }
        } else {
          const params = isRestore ? '?restore=true' : '';
          navigate(`/legal${params}`);
        }
        return;
      }

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

      window.close();
    },
    [navigate],
  );

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

  const handleClickDot = (index: number) => {
    if (!slideTransitions) {
      setSlideTransitions(true);
    }
    setCurrentStepIndex(index);
    setTransitionDirection(index > currentStepIndex ? 'right' : 'left');
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
      <AppVersion>{t('BETA')}</AppVersion>
      {animationComplete ? (
        <Container>
          <ArrowContainer>
            <CaretButton disabled={currentStepIndex <= 0} onClick={handleClickBack}>
              <CaretLeft
                size={theme.space.l}
                color={theme.colors.white_0}
                opacity={currentStepIndex > 0 ? '100%' : '60%'}
              />
            </CaretButton>
            <CaretButton
              disabled={currentStepIndex >= onboardingViews.length - 1}
              onClick={handleClickNext}
            >
              <CaretRight
                size={theme.space.l}
                color={theme.colors.white_0}
                opacity={currentStepIndex < onboardingViews.length - 1 ? '100%' : '60%'}
              />
            </CaretButton>
          </ArrowContainer>
          {renderTransitions()}
          <BottomContainer>
            <Dots
              numDots={onboardingViews.length}
              activeIndex={currentStepIndex}
              dotStrategy="selection"
              handleClickDot={handleClickDot}
              size={6}
            />
            <CreateButton onClick={() => proceedToWallet()} title={t('CREATE_WALLET_BUTTON')} />
            <RestoreButton
              variant="secondary"
              onClick={() => proceedToWallet(true)}
              title={t('RESTORE_WALLET_BUTTON')}
            />
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
