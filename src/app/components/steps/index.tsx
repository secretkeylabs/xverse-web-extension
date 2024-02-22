import { nanoid } from 'nanoid';
import styled from 'styled-components';

const StepsContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StepsDot = styled.div<StepDotProps>((props) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: props.active ? props.theme.colors.action.classic : props.theme.colors.elevation3,
  marginRight: props.theme.spacing(4),
}));

interface StepsProps {
  data: any[];
  activeIndex: number;
  dotStrategy?: 'completion' | 'selection';
}

interface StepDotProps {
  active: boolean;
}

export default function Steps(props: StepsProps): JSX.Element {
  const { data, activeIndex, dotStrategy } = props;
  const getStrategy = (index: number) => {
    if (dotStrategy === 'selection') {
      return index === activeIndex;
    }
    return index <= activeIndex;
  };
  return (
    <StepsContainer>
      {data.map((view, index) => (
        <StepsDot active={getStrategy(index)} key={nanoid()} />
      ))}
    </StepsContainer>
  );
}
