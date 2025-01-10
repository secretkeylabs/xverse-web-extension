import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import Button from '@ui-library/button';
import styled from 'styled-components';

type ControlsProps = {
  /**
   * Zero-based index of the current element.
   */
  currentIndex: number;
  totalElements: number;
  onNext: () => void;
  onPrev: () => void;
};

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.space.xs,
}));

const ControlButton = styled(Button)(({ theme }) => ({
  width: theme.space.xxl,
  height: theme.space.xxl,
  padding: 'initial',
}));

export function Controls({ currentIndex, totalElements, onNext, onPrev }: ControlsProps) {
  return (
    <Container>
      <ControlButton
        title=""
        variant="secondary"
        onClick={onPrev}
        icon={<ArrowLeft size={16} weight="bold" />}
        disabled={currentIndex === 0}
      />
      <ControlButton
        title=""
        variant="secondary"
        onClick={onNext}
        icon={<ArrowRight size={16} weight="bold" />}
        iconPosition="right"
        disabled={currentIndex === totalElements - 1}
      />
    </Container>
  );
}
