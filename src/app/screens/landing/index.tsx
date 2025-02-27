import animationData from '@assets/animation/full_logo_horizontal.json';
import logo from '@assets/img/full_logo_horizontal.svg';
import onboarding1 from '@assets/img/landing/onboarding1.svg';
import onboarding2 from '@assets/img/landing/onboarding2.svg';
import Dots from '@components/dots';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { isInOptions } from '@utils/helper';
import { getIsTermsAccepted } from '@utils/localStorage';
import RoutePaths from 'app/routes/paths';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'react-lottie';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'styled-components';
import {
  AnimationContainer,
  AppVersion,
  ArrowContainer,
  BottomContainer,
  CaretButton,
  Container,
  CreateButton,
  InitialTransitionLandingSectionContainer,
  LandingTitle,
  LeftTransitionLandingSectionContainer,
  LeftTransitionOnboardingContainer,
  Logo,
  OnBoardingContent,
  OnBoardingImage,
  OnboardingTitle,
  RestoreButton,
  RightTransitionLandingSectionContainer,
  RightTransitionOnboardingContainer,
} from './index.styled';

function Landing() {
  const { t } = useTranslation('translation', { keyPrefix: 'LANDING_SCREEN' });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(
    process.env.SKIP_ANIMATION_WALLET_STARTUP === 'true',
  );
  const [slideTransitions, setSlideTransitions] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');
  const navigate = useNavigate();
  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

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
            navigate(RoutePaths.RestoreWallet);
          } else {
            navigate(RoutePaths.CreateWallet);
          }
        } else {
          const params = isRestore ? '?restore=true' : '';
          navigate(`${RoutePaths.Legal}${params}`);
        }
        return;
      }

      const allTabs = await chrome.tabs.query({});
      const baseUrl = chrome.runtime.getURL('');
      const existingTab = allTabs.find((tab) => tab.url && tab.url.includes(baseUrl));
      let url: string;

      if (isLegalAccepted) {
        const targetUrlSuffix = isRestore ? RoutePaths.RestoreWallet : RoutePaths.CreateWallet;
        url = chrome.runtime.getURL(`options.html#${targetUrlSuffix}`);
      } else {
        const params = isRestore ? '?restore=true' : '';
        url = chrome.runtime.getURL(`options.html#${RoutePaths.Legal}${params}`);
      }

      if (existingTab?.id) {
        // Activate the existing tab
        await chrome.tabs.update(existingTab.id, { active: true, url });
        await chrome.windows.update(existingTab.windowId, { focused: true });
      } else {
        // Open a new tab
        await chrome.tabs.create({ url });
      }

      const currentTab = await chrome.tabs.getCurrent();
      if (existingTab?.id !== currentTab?.id) {
        window.close();
      }
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
      const TransitionLandingSectionContainer =
        transitionDirection === 'right'
          ? RightTransitionLandingSectionContainer
          : LeftTransitionLandingSectionContainer;

      const TransitionOnboardingContainer =
        transitionDirection === 'right'
          ? RightTransitionOnboardingContainer
          : LeftTransitionOnboardingContainer;

      switch (currentStepIndex) {
        case 0:
          return (
            <TransitionLandingSectionContainer key={currentStepIndex}>
              {renderLandingSection()}
            </TransitionLandingSectionContainer>
          );
        default:
          return (
            <TransitionOnboardingContainer key={currentStepIndex}>
              {renderOnboardingContent(currentStepIndex)}
            </TransitionOnboardingContainer>
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
            <CaretButton $disabled={currentStepIndex <= 0} onClick={handleClickBack}>
              <CaretLeft
                size={theme.space.l}
                color={theme.colors.white_0}
                opacity={currentStepIndex > 0 ? '100%' : '60%'}
              />
            </CaretButton>
            <CaretButton
              $disabled={currentStepIndex >= onboardingViews.length - 1}
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
              handleClickDot={handleClickDot}
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
            width={isGalleryOpen ? '42.5%' : '70%'}
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
