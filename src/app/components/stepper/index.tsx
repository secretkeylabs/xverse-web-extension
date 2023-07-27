import styled from 'styled-components';
import checkmarkIcon from '@assets/img/checkmarkIcon.svg';

interface StepperProps {
  isActive?: boolean;
  isCompleted?: boolean;
}

const Container = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  userSelect: 'none',
});

const Title = styled.div<StepperProps>((props) => ({
  marginTop: props.theme.spacing(8),
  fontSize: '0.875rem',
  fontWeight: 500,
  color: props.isActive ? props.theme.colors.white[0] : props.theme.colors.white[600],
  transition: 'color 0.3s ease',
}));

const Dot = styled.div<StepperProps>((props) => ({
  height: 30,
  width: 30,
  backgroundColor: props.isCompleted
    ? props.theme.colors.feedback.success
    : props.isActive
    ? '#4C525F'
    : 'transparent',
  border: '2px solid',
  borderColor: props.isCompleted ? props.theme.colors.feedback.success : '#4C525F',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: props.theme.colors.white[0],
  fontWeight: 'bold',
  fontSize: '0.875rem',
  flex: '1 0 auto',
  transition: 'background-color 0.3s ease, border-color 0.3s ease',
  '&::after': {
    content: '""',
    display: props.isActive ? 'block' : 'none',
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: props.theme.colors.white[0],
  },
}));

const Line = styled.div<StepperProps>((props) => ({
  height: 2,
  width: '100%',
  background: `linear-gradient(90deg, ${props.theme.colors.feedback.success} ${
    props.step === 0 ? '0%' : props.step > 1 ? '100%' : '50%'
  }, #4C525F ${props.step > 0 ? '50%' : '0%'})`,
  marginTop: props.theme.spacing(8),
}));

interface Props {
  steps: { title: string; isCompleted: boolean }[];
}

// TODO: Make this component more generic
export default function Stepper({ steps }: Props): JSX.Element {
  const currentStepIndex = steps.findIndex((step) => !step.isCompleted);
  const currentStep = currentStepIndex > -1 ? currentStepIndex : steps.length;

  return (
    <>
      <Container>
        <Dot isCompleted={steps[0].isCompleted} isActive={currentStep === 0}>
          {steps[0].isCompleted ? <img src={checkmarkIcon} /> : currentStep !== 0 ? '1' : ''}
        </Dot>
        <Line step={currentStep} />
        <Dot isCompleted={steps[1].isCompleted} isActive={currentStep === 1}>
          {steps[1].isCompleted ? <img src={checkmarkIcon} /> : currentStep !== 1 ? '2' : ''}
        </Dot>
      </Container>
      <Container>
        {steps.map((step, index) => (
          <Title key={step.title} isActive={currentStep === index}>
            {step.title}
          </Title>
        ))}
      </Container>
    </>
  );
}
