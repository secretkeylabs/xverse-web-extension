import { animated, easings, useSpring } from '@react-spring/web';
import className from 'classnames';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Theme from 'theme';

const svgSize = 88;
const radius = 33;
const circumference = 2 * Math.PI * radius;

export type ConfirmationStatus = 'LOADING' | 'SUCCESS' | 'FAILURE';

const getStrokeColorByStatus = (status: ConfirmationStatus) =>
  ({
    LOADING: Theme.colors.white_0,
    SUCCESS: Theme.colors.success_medium,
    FAILURE: Theme.colors.danger_dark_600,
  }[status]);

const StyledSvg = styled.svg<{ status: ConfirmationStatus; loadingPercentage: number }>`
  .circle,
  .check,
  .cross {
    stroke: ${(props) => getStrokeColorByStatus(props.status)};
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .circle {
    transform-origin: 50% 50%;
    transform: rotate(180deg) scale(-1, 1);
    stroke-dasharray: ${circumference};
  }
  .check,
  .cross {
    visibility: hidden;
    &.visible {
      visibility: visible;
      animation: slideY 0.2s ease-in;
    }
  }
  @keyframes slideY {
    0% {
      opacity: 0;
      transform: translateY(8px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export function CircularSvgAnimation({
  status,
  loadingPercentage,
  onRest,
}: {
  status: ConfirmationStatus;
  loadingPercentage: number;
  onRest?: () => void;
}) {
  const [isCircleRested, setIsCircleRested] = useState(false);

  const [circleProps] = useSpring(
    () => ({
      from: { strokeDashoffset: `${circumference}` },
      to: { strokeDashoffset: `${(1 - loadingPercentage) * circumference}` },
      onStart: () => setIsCircleRested(false),
      onRest: () => setIsCircleRested(true),
      config: { duration: 200, easing: easings.easeOutCubic },
    }),
    [loadingPercentage],
  );

  useEffect(() => {
    if (isCircleRested && status !== 'LOADING') {
      onRest?.();
    }
  }, [onRest, isCircleRested, status]);

  const checkClass = className({ check: true, visible: isCircleRested && status === 'SUCCESS' });
  const crossClass = className({ cross: true, visible: isCircleRested && status === 'FAILURE' });

  return (
    <animated.div>
      <StyledSvg
        status={status}
        loadingPercentage={loadingPercentage}
        xmlns="http://www.w3.org/2000/svg"
        height={svgSize}
        width={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        fill="none"
      >
        <path className={checkClass} d="M59.125 35.75L38.9582 55L28.875 45.375" />
        <animated.path
          className="circle"
          d="M44 77C62.2254 77 77 62.2254 77 44C77 25.7746 62.2254 11 44 11C25.7746 11 11 25.7746 11 44C11 62.2254 25.7746 77 44 77Z"
          style={circleProps}
        />
        <g className={crossClass}>
          <path d="M55 33L33 55" />
          <path d="M55 55L33 33" />
        </g>
      </StyledSvg>
    </animated.div>
  );
}
export default CircularSvgAnimation;
