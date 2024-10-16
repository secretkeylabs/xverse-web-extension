import Callout, { type CalloutProps } from '@ui-library/callout';
import { useContext, useEffect, useState, type MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { tooltipContext } from './context';

type Position = {
  $left?: number;
  $right?: number;
  $top?: number;
  $bottom?: number;
};

const TooltipContainer = styled.div<Position>`
  position: absolute;
  ${(props) => (props.$left !== undefined ? `left: ${props.$left}px` : '')};
  ${(props) => (props.$right !== undefined ? `right: ${props.$right}px` : '')};
  ${(props) => (props.$top !== undefined ? `top: ${props.$top}px` : '')};
  ${(props) => (props.$bottom !== undefined ? `bottom: ${props.$bottom}px` : '')};

  &::after {
    content: '';
    position: absolute;
    ${(props) => (props.$left !== undefined ? `left: 10px` : '')};
    ${(props) => (props.$right !== undefined ? `right: 10px` : '')};
    ${(props) => (props.$top !== undefined ? `top: -5px` : '')};
    ${(props) => (props.$bottom !== undefined ? `bottom: -5px` : '')};
    border-width: 5px;
    border-style: solid;
    border-color: #2d2f34;
    transform: rotate(45deg);
  }
`;

const StyledCallout = styled(Callout)(() => ({
  backgroundColor: '#2d2f34',
}));

type Props = CalloutProps & {
  target: MutableRefObject<HTMLButtonElement | null>;
  positionVertical?: 'top' | 'bottom';
  positionHorizontal?: 'left' | 'right';
};

export default function TooltipCallout(props: Props) {
  const tooltip = useContext(tooltipContext);

  const [position, setPosition] = useState<Position>({});

  const {
    target,
    className,
    positionHorizontal = 'left',
    positionVertical = 'bottom',
    ...calloutProps
  } = props;

  const tooltipBody = (
    <TooltipContainer className={className} {...position}>
      <StyledCallout {...calloutProps} />
    </TooltipContainer>
  );

  useEffect(() => {
    if (!target.current) {
      console.warn('Tooltip set without a target');
      return;
    }

    const targetRect = target.current.getBoundingClientRect();
    const newPosition: Position = {};

    const spacer = 5;

    if (positionVertical === 'bottom') {
      newPosition.$top = targetRect.y + targetRect.height + spacer;
    } else {
      newPosition.$bottom = window.innerHeight - targetRect.y + spacer;
    }

    if (positionHorizontal === 'left') {
      newPosition.$right = window.innerWidth - targetRect.x - targetRect.width;
    } else {
      newPosition.$left = targetRect.x;
    }

    setPosition(newPosition);
  }, [positionHorizontal, positionVertical, target]);

  if (tooltip.initialised && tooltip.targetDiv) {
    return createPortal(tooltipBody, tooltip.targetDiv);
  }
}
