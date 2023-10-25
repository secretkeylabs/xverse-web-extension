import checkmarkIcon from '@assets/img/checkmarkIcon.svg';
import styled from 'styled-components';

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
  color: props.isActive ? props.theme.colors.white_0 : props.theme.colors.white_600,
  transition: 'color 0.3s ease',
}));

const getBackgroundColor = (props) => {
  if (props.isCompleted) {
    return props.theme.colors.success_medium;
  }
  if (props.isActive) {
    return '#4C525F';
  }
  return 'transparent';
};

const Dot = styled.div<StepperProps>((props) => ({
  height: 30,
  width: 30,
  backgroundColor: getBackgroundColor(props),
  border: '2px solid',
  borderColor: props.isCompleted
    ? props.theme.colors.success_medium
    : props.theme.colors.elevation6,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: props.theme.colors.white_0,
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
    backgroundColor: props.theme.colors.white_0,
  },
}));

const calculateColorStops = (props) => {
  const successColor = props.theme.colors.success_medium;

  // Calculate the color stops
  let startStop: string;
  if (props.step === 0) startStop = '0%';
  if (props.step > 1) startStop = '100%';
  else startStop = '50%';
  const endStop = props.step > 0 ? '50%' : '0%';

  return `${successColor} ${startStop}, #4C525F ${endStop}`;
};

type LineProps = { step: number };
const Line = styled.div<LineProps>((props) => ({
  height: 2,
  width: '100%',
  background: `linear-gradient(90deg, ${calculateColorStops(props)})`,
  marginTop: props.theme.spacing(8),
}));

interface Props {
  steps: { title: string; isCompleted: boolean }[];
}

// TODO: Make this component more generic
export default function Stepper({ steps }: Props): JSX.Element {
  const currentStepIndex = steps.findIndex((step) => !step.isCompleted);
  const currentStep = currentStepIndex > -1 ? currentStepIndex : steps.length;

  function getContentForDot(stepIndex: number, isCompleted: boolean, currentPosition: number) {
    if (isCompleted) {
      return <img src={checkmarkIcon} alt="Check Icon" />;
    }
    if (currentPosition !== stepIndex) {
      return String(stepIndex + 1);
    }
    return '';
  }
  return (
    <>
      <Container>
        <Dot isCompleted={steps[0].isCompleted} isActive={currentStep === 0}>
          {getContentForDot(0, steps[0].isCompleted, currentStep)}
        </Dot>
        <Line step={currentStep} />
        <Dot isCompleted={steps[1].isCompleted} isActive={currentStep === 1}>
          {getContentForDot(1, steps[1].isCompleted, currentStep)}
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
