import styled from 'styled-components';

const Container = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const DotWrapper = styled.button((props) => ({
  cursor: props.onClick ? 'pointer' : 'default',
  padding: props.theme.space.xxs,
  backgroundColor: 'transparent',
}));

const Dot = styled.div<{
  $active: boolean;
  $size?: number;
}>((props) => ({
  width: props.$size ?? 8,
  height: props.$size ?? 8,
  borderRadius: 50,
  backgroundColor: props.$active ? props.theme.colors.white_0 : props.theme.colors.white_800,
}));

type Props = {
  numDots: number;
  activeIndex: number;
  dotStrategy?: 'completion' | 'selection';
  size?: number;
  handleClickDot?: (index: number) => void;
};

export default function Dots({
  numDots,
  activeIndex,
  dotStrategy,
  size,
  handleClickDot,
}: Props): JSX.Element {
  const getStrategy = (index: number) => {
    if (dotStrategy === 'selection') {
      return index === activeIndex;
    }
    return index <= activeIndex;
  };

  return (
    <Container>
      {Array.from({ length: numDots }, (_, i) => (
        <DotWrapper key={i} onClick={handleClickDot ? () => handleClickDot(i) : undefined}>
          <Dot $active={getStrategy(i)} $size={size} />
        </DotWrapper>
      ))}
    </Container>
  );
}
