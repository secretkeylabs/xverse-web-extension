import ActionButton from '@components/button';
import className from 'classnames';
import styled from 'styled-components';
import { StyledP, StyledHeading, VerticalStackButtonContainer } from '@ui-library/common.styled';
import { animated, easings, useSpring } from '@react-spring/web';
import { useState } from 'react';
import { CircularSvgAnimation, ConfirmationStatus } from './circularSvgAnimation';

type Texts = {
  title: string;
  description: string | React.ReactNode;
};

type Action = {
  onPress: () => void;
  text: string;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing(8)}px;
  padding-top: ${(props) => props.theme.spacing(68)}px;
  position: relative;
  height: 100%;
`;

const CenterAlignContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AnimatedBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
`;

const AnimatedBody = styled(animated.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const BottomFixedContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: ${(props) => props.theme.spacing(8)}px;
  padding-bottom: 0;
  margin-bottom: ${(props) => props.theme.spacing(32)}px;
  visibility: hidden;

  &.visible {
    visibility: visible;
    animation: slideY 0.2s ease-in;
  }
  @keyframes slideY {
    0% {
      opacity: 0;
      transform: translateY(16px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StatusLarge = styled.div`
  min-width: 88px;
  min-height: 88px;
  padding: 22px;
  margin-bottom: 8px;
`;

const Heading = styled(StyledHeading)`
  margin-bottom: 6px;
`;

/**
 *
 * @param status - The status of the transaction (Loading, Success, Failure)
 * @param resultText - The text to display when the transaction is complete (Success or Failure)
 * @param loadingTexts - The text to display when the transaction is loading
 * @param primaryAction - The first action to display (text and onPress)
 * @param secondaryAction - The second action to display (text and onPress)
 * @param loadingPercentage - The progress of the loading animation (0-1)
 */
export function LoadingTransactionStatus({
  status,
  resultTexts,
  loadingTexts,
  primaryAction,
  secondaryAction,
  loadingPercentage,
}: {
  status: ConfirmationStatus;
  resultTexts: Texts;
  loadingTexts: Texts;
  primaryAction: Action;
  secondaryAction: Action;
  loadingPercentage: number;
}) {
  const [hasCircleAnimationRested, setHasCircleAnimationRested] = useState(false);

  const visibleClass = className({
    visible: hasCircleAnimationRested && status !== 'LOADING',
  });

  const [resultBodyProps, finishedBodyApi] = useSpring(
    () => ({
      from: { opacity: 0, transform: 'translateY(16px)' },
      config: { duration: 200, easing: easings.easeInOutCubic },
    }),
    [],
  );

  const [loadingBodyProps, loadingBodyApi] = useSpring(
    () => ({
      from: { opacity: 1 },
      onRest: () => finishedBodyApi.start({ opacity: 1, transform: 'translateY(0)' }),
      config: { duration: 200, easing: easings.easeInOutCubic },
    }),
    [],
  );

  const handleAnimationRest = () => {
    setHasCircleAnimationRested(true);
    loadingBodyApi.start({ to: { opacity: 0 } });
  };

  return (
    <Container>
      <CenterAlignContainer>
        <StatusLarge>
          <CircularSvgAnimation
            status={status}
            loadingPercentage={loadingPercentage}
            onRest={handleAnimationRest}
          />
        </StatusLarge>
        <AnimatedBodyContainer>
          <AnimatedBody style={resultBodyProps}>
            <Heading typography="headline_xs">{resultTexts?.title}</Heading>
            <StyledP typography="body_medium_m" color="white_200">
              {resultTexts?.description}
            </StyledP>
          </AnimatedBody>
          <AnimatedBody style={loadingBodyProps}>
            <Heading typography="headline_xs">{loadingTexts?.title}</Heading>
            <StyledP typography="body_medium_m" color="white_200">
              {loadingTexts?.description}
            </StyledP>
          </AnimatedBody>
        </AnimatedBodyContainer>
      </CenterAlignContainer>
      <BottomFixedContainer className={visibleClass}>
        <VerticalStackButtonContainer>
          <ActionButton text={primaryAction.text} onPress={primaryAction.onPress} />
          {status === 'SUCCESS' && (
            <ActionButton
              text={secondaryAction.text}
              onPress={secondaryAction.onPress}
              transparent
            />
          )}
        </VerticalStackButtonContainer>
      </BottomFixedContainer>
    </Container>
  );
}
export default LoadingTransactionStatus;
