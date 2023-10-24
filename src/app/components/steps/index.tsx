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
}

interface StepDotProps {
  active: boolean;
}

export default function Steps(props: StepsProps): JSX.Element {
  const { data, activeIndex } = props;
  return (
    <StepsContainer>
      {data.map((view, index) => (
        <StepsDot active={index <= activeIndex} key={nanoid()} />
      ))}
    </StepsContainer>
  );
}
