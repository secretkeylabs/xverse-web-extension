import animationData from '@assets/animations/full_logo_horizontal.json';
import logo from '@assets/img/full_logo_horizontal.svg';
import onboarding1 from '@assets/img/landing/onboarding1.svg';
import onboarding2 from '@assets/img/landing/onboarding2.svg';
import Steps from '@components/steps';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { animated, useTransition } from '@react-spring/web';
import { DEFAULT_TRANSITION_OPTIONS } from '@utils/constants';
import { isInOptions } from '@utils/helper';
import { getIsTermsAccepted } from '@utils/localStorage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'react-lottie';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, useTheme } from 'styled-components';

const slideYAndOpacity = keyframes`
    0% {
        opacity: 0;
        transform: translateY(68px);
      }
    100% {
        opacity: 1;
        transform: translateY(0);
      }
  `;

const slideY = keyframes`
    0% {
        transform: translateY(68px);
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
  animation: ${() => slideOpacity} 0.2s linear;
`;

const StyledCaretLeft = styled(CaretLeft)`
  cursor: ${(props) => (props.opacity === '60%' ? 'default' : 'pointer')};
`;

const StyledCaretRight = styled(CaretRight)`
  cursor: ${(props) => (props.opacity === '60%' ? 'default' : 'pointer')};
`;

const LandingSectionContainer = styled.div({
  paddingTop: 165,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const Logo = styled(animated.img)`
  width: 185px;
  height: 36px;
`;

const LandingTitle = styled(animated.h1)`
  ${(props) => props.theme.typography.body_medium_l}
  margin-top: 17px;
  color: ${(props) => props.theme.colors.white_200};
  text-align: center;
`;

const TransitionLogo = styled.img`
  width: 185px;
  height: 36px;
  animation: ${() => slideY} 0.2s linear;
`;

const TransitionLandingTitle = styled.h1`
  ${(props) => props.theme.typography.body_medium_l}
  margin-top: 17px;
  color: ${(props) => props.theme.colors.white_200};
  text-align: center;
  animation: ${() => slideYAndOpacity} 0.2s linear;
`;

const OnBoardingImage = styled(animated.img)(() => ({
  marginTop: -25,
  alignSelf: 'center',
  transform: 'all',
}));

const OnBoardingContentContainer = styled(animated.div)((props) => ({
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
  margin-top: auto;
  margin-left: ${(props) => props.theme.space.m};
  margin-right: ${(props) => props.theme.space.m};
  margin-bottom: ${(props) => props.theme.space.xxxl};
  animation: ${() => slideYAndOpacity} 0.2s linear;
`;

const StepsContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
}));

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

const AnimationContainer = styled.div({
  paddingTop: 205,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

function Landing() {
  const { t } = useTranslation('translation', { keyPrefix: 'LANDING_SCREEN' });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(false);
  const navigate = useNavigate();
  const transition = useTransition(currentStepIndex, DEFAULT_TRANSITION_OPTIONS);
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

  const handleClickNext = () => {
    if (!(currentStepIndex === onboardingViews.length - 1)) {
      setCurrentStepIndex((curStepIndex) => curStepIndex + 1);
      setTransitionComplete(true);
    }
  };

  const handleClickBack = () => {
    if (currentStepIndex !== 0) {
      setCurrentStepIndex((curStepIndex) => curStepIndex - 1);
    }
  };

  const proceedToWallet = async (isRestore?: boolean) => {
    const isLegalAccepted = getIsTermsAccepted();
    if (isLegalAccepted) {
      if (isRestore) {
        if (!isInOptions()) {
          await chrome.tabs.create({
            url: chrome.runtime.getURL(`options.html#/restoreWallet`),
          });
        } else {
          navigate('/restoreWallet', { replace: true });
        }
      } else {
        navigate('/backup', { replace: true });
      }
    } else {
      const params = isRestore ? '?restore=true' : '';
      navigate(`/legal${params}`, { replace: true });
    }
  };

  return (
    <Container>
      <AppVersion>Beta</AppVersion>
      {animationComplete ? (
        <>
          <ArrowContainer>
            <StyledCaretLeft
              onClick={handleClickBack}
              size={theme.space.l}
              color={theme.colors.white_0}
              opacity={currentStepIndex > 0 ? '100%' : '60%'}
            />
            <StyledCaretRight
              onClick={handleClickNext}
              size={theme.space.l}
              color={theme.colors.white_0}
              opacity={currentStepIndex < onboardingViews.length - 1 ? '100%' : '60%'}
            />
          </ArrowContainer>
          {transition((style, index) => (
            <Container>
              {index === 0 && transitionComplete && (
                <LandingSectionContainer>
                  <Logo style={style} src={onboardingViews[index].image} alt="logo" />
                  <LandingTitle style={style}>{onboardingViews[index].title}</LandingTitle>
                </LandingSectionContainer>
              )}
              {index === 0 && !transitionComplete && (
                <LandingSectionContainer>
                  <TransitionLogo src={onboardingViews[index].image} alt="logo" />
                  <TransitionLandingTitle>{onboardingViews[index].title}</TransitionLandingTitle>
                </LandingSectionContainer>
              )}
              {index !== 0 && (
                <>
                  <OnBoardingImage
                    src={onboardingViews[index].image}
                    alt="onboarding"
                    style={style}
                    height={250}
                  />
                  <OnBoardingContentContainer style={style}>
                    <OnboardingTitle needPadding={index === 2}>
                      {onboardingViews[index].title}
                    </OnboardingTitle>
                  </OnBoardingContentContainer>
                </>
              )}
            </Container>
          ))}
          <BottomContainer>
            <StepsContainer>
              <Steps data={onboardingViews} activeIndex={currentStepIndex} />
            </StepsContainer>
            <CreateButton onClick={() => proceedToWallet()}>
              {t('CREATE_WALLET_BUTTON')}
            </CreateButton>
            <RestoreButton onClick={() => proceedToWallet(true)}>
              {t('RESTORE_WALLET_BUTTON')}
            </RestoreButton>
          </BottomContainer>
        </>
      ) : (
        <AnimationContainer>
          <Lottie
            options={{ loop: false, animationData }}
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
