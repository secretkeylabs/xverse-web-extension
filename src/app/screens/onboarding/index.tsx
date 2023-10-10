import onboarding1 from '@assets/img/onboarding/onboarding1.svg';
import onboarding2 from '@assets/img/onboarding/onboarding2.svg';
import onboarding3 from '@assets/img/onboarding/onboarding3.png';
import ActionButton from '@components/button';
import Steps from '@components/steps';
import { animated, useTransition } from '@react-spring/web';
import { DEFAULT_TRANSITION_OPTIONS } from '@utils/constants';
import { getIsTermsAccepted, saveHasFinishedOnboarding } from '@utils/localStorage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  margin-left: auto;
  margin-right: auto;
  flex-direction: column;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const StepsContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(10),
}));

const OnBoardingImage = styled(animated.img)((props) => ({
  marginTop: props.theme.spacing(25),
  alignSelf: 'center',
  transform: 'all',
}));
const OnBoardingContentContainer = styled(animated.div)((props) => ({
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
  marginTop: props.theme.spacing(8),
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

const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(8),
  width: '100%',
}));

function Onboarding(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const { t } = useTranslation('translation', { keyPrefix: 'ONBOARDING_SCREEN' });
  const navigate = useNavigate();
  const transition = useTransition(currentStepIndex, DEFAULT_TRANSITION_OPTIONS);
  const [searchParams] = useSearchParams();

  const onboardingViews = [
    {
      image: onboarding1,
      imageWidth: '100%',
      title: t('ONBOARDING_1_TITlE'),
      subtitle: t('ONBOARDING_1_SUBTITlE'),
    },
    {
      image: onboarding2,
      imageWidth: 178,
      title: t('ONBOARDING_2_TITlE'),
      subtitle: t('ONBOARDING_2_SUBTITlE'),
    },
    {
      image: onboarding3,
      imageWidth: 192,
      title: t('ONBOARDING_3_TITlE'),
      subtitle: t('ONBOARDING_3_SUBTITlE'),
    },
  ];

  const handleClickNext = () => {
    setCurrentStepIndex((prevStepIndex) => prevStepIndex + 1);
  };

  const handleSkip = () => {
    saveHasFinishedOnboarding(true);
    const isLegalAccepted = getIsTermsAccepted();
    const isRestore = !!searchParams.get('restore');

    if (isLegalAccepted) {
      if (isRestore) {
        navigate('/restoreWallet', { replace: true });
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
      <StepsContainer>
        <Steps data={onboardingViews} activeIndex={currentStepIndex} />
      </StepsContainer>
      {transition((style, index) => (
        <>
          <OnBoardingImage
            src={onboardingViews[index].image}
            alt="onboarding"
            style={style}
            width={onboardingViews[index].imageWidth}
          />
          <OnBoardingContentContainer style={style}>
            <OnboardingTitle>{onboardingViews[index].title}</OnboardingTitle>
            <OnboardingSubTitle>{onboardingViews[index].subtitle}</OnboardingSubTitle>
          </OnBoardingContentContainer>
          {index === onboardingViews.length - 1 ? (
            <OnBoardingActionsContainer>
              <ActionButton onPress={handleSkip} text={t('ONBOARDING_CONTINUE_BUTTON')} />
            </OnBoardingActionsContainer>
          ) : (
            <OnBoardingActionsContainer>
              <TransparentButtonContainer>
                <ActionButton onPress={handleSkip} transparent text={t('ONBOARDING_SKIP_BUTTON')} />
              </TransparentButtonContainer>
              <ActionButton onPress={handleClickNext} text={t('ONBOARDING_NEXT_BUTTON')} />
            </OnBoardingActionsContainer>
          )}
        </>
      ))}
    </Container>
  );
}

export default Onboarding;
