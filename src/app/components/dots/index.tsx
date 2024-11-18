import styled from 'styled-components';

const Container = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const DotButton = styled.button((props) => ({
  cursor: props.onClick ? 'pointer' : 'default',
  padding: 3,
  backgroundColor: 'transparent',
}));

const Dot = styled.div<{
  $active: boolean;
  $size?: number;
}>((props) => ({
  width: props.$active ? 18 : props.$size ?? 6,
  height: props.$size ?? 6,
  borderRadius: 50,
  backgroundColor: props.$active ? props.theme.colors.white_0 : props.theme.colors.white_600,
}));

type Props = {
  numDots: number;
  activeIndex: number;
  size?: number;
  handleClickDot?: (index: number) => void;
};

export default function Dots({ numDots, activeIndex, size, handleClickDot }: Props): JSX.Element {
  return (
    <Container>
      {Array.from({ length: numDots }, (_, i) => (
        <DotButton
          key={i}
          onClick={handleClickDot ? () => handleClickDot(i) : undefined}
          tabIndex={handleClickDot ? 0 : -1} // for accessibility, to avoid focus on the dots when they are not clickable
        >
          <Dot $active={i === activeIndex} $size={size} />
        </DotButton>
      ))}
    </Container>
  );
}
