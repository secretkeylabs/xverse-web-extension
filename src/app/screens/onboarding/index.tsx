import { useState } from 'react';
import onboarding1 from '@assets/img/onboarding/onboarding1.svg';
import onboarding2 from '@assets/img/onboarding/onboarding2.svg';
import onboarding3 from '@assets/img/onboarding/onboarding3.svg';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const OnBoardingDotsContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.spacing(10),
  justifyContent: 'center',
}));
const OnboardingDot = styled.div((props) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: props.active
    ? props.theme.colors.action.classic
    : props.theme.colors.background.elevation3,
  marginRight: props.theme.spacing(4),
}));
const OnBoardingImage = styled.img((props) => ({
  marginTop: props.theme.spacing(25),
  alignSelf: 'center',
  transform: 'all',
}));
const OnBoardingContentContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'center',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));
const OnboardingTitle = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
}));
const OnboardingSubTitle = styled.h1((props) => ({
  ...props.theme.body_l,
  textAlign: 'center',
  marginTop: props.theme.spacing(10),
  color: props.theme.colors.white['200'],
}));
const OnBoardingActionsContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
}));

const OnBoardingNextButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  marginLeft: props.theme.spacing(8),
  color: props.theme.colors.white['0'],
  width: '45%',
  height: 44,
}));

const OnBoardingSkipButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.background.elevation0,
  border: '1px solid #272A44',
  marginLeft: props.theme.spacing(8),
  color: props.theme.colors.white['0'],
  width: '45%',
  height: 44,
}));

const OnBoardingContinueButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
  color: props.theme.colors.white['0'],
  width: '90%',
  height: 44,
}));

function Onboarding(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const { t } = useTranslation('translation', { keyPrefix: 'ONBOARDING_SCREEN' });
  const navigate = useNavigate();
  const onboardingViews = [
    {
      image: onboarding1,
      imageWidth: '100%',
      title: t('ONBOARDING_1_TITlE'),
      subtitle: t('ONBOARDING_2_SUBTITlE'),
    },
    {
      image: onboarding2,
      imageWidth: 163,
      title: t('ONBOARDING_1_TITlE'),
      subtitle: t('ONBOARDING_2_SUBTITlE'),
    },
    {
      image: onboarding3,
      imageWidth: 192,
      title: t('ONBOARDING_1_TITlE'),
      subtitle: t('ONBOARDING_3_SUBTITlE'),
    },
  ];
  const handleClickNext = () => {
    setCurrentStepIndex(currentStepIndex + 1);
  };

  const handleSkip = () => {
    navigate('/home');
  };
  return (
    <>
      <OnBoardingDotsContainer>
        {onboardingViews.map((view, index) => (
          <OnboardingDot active={index === currentStepIndex} />
        ))}
      </OnBoardingDotsContainer>
      <OnBoardingImage
        src={onboardingViews[currentStepIndex].image}
        alt="onboarding1"
        width={onboardingViews[currentStepIndex].imageWidth}
      />
      <OnBoardingContentContainer>
        <OnboardingTitle>{onboardingViews[currentStepIndex].title}</OnboardingTitle>
        <OnboardingSubTitle>{onboardingViews[currentStepIndex].subtitle}</OnboardingSubTitle>
      </OnBoardingContentContainer>
      {currentStepIndex === onboardingViews.length - 1 ? (
        <OnBoardingContinueButton onClick={handleSkip}>Continue</OnBoardingContinueButton>
      ) : (
        <OnBoardingActionsContainer>
          <OnBoardingSkipButton onClick={handleSkip}>Skip</OnBoardingSkipButton>
          <OnBoardingNextButton onClick={handleClickNext}>Next</OnBoardingNextButton>
        </OnBoardingActionsContainer>
      )}
    </>
  );
}

export default Onboarding;
