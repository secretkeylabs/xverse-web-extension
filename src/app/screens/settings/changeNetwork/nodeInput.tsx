import Cross from '@assets/img/settings/x.svg';
import styled from 'styled-components';

const NodeInputHeader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(1),
  paddingRight: props.theme.spacing(1),
}));

const NodeText = styled.label((props) => ({
  ...props.theme.typography.body_medium_m,
}));

const NodeResetButton = styled.button((props) => ({
  background: 'none',
  color: props.theme.colors.white_200,
}));

const InputContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  border: `1px solid ${props.theme.colors.elevation3}`,
  backgroundColor: props.theme.colors.elevation_n1,
  borderRadius: props.theme.radius(1),
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(3),
}));

const ErrorMessage = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.feedback.error,
}));

const Input = styled.input((props) => ({
  ...props.theme.typography.body_medium_m,
  height: 44,
  display: 'flex',
  flex: 1,
  backgroundColor: props.theme.colors.elevation_n1,
  color: props.theme.colors.white_0,
  border: 'none',
}));

const Button = styled.button({
  background: 'none',
});

function NodeInput({
  label,
  onChange,
  value,
  onClear,
  onReset,
  error,
}: {
  label: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  onClear: () => void;
  onReset: () => void;
  error: string;
}) {
  return (
    <div>
      <NodeInputHeader>
        <NodeText>{label}</NodeText>
        <NodeResetButton onClick={onReset}>Reset to default</NodeResetButton>
      </NodeInputHeader>
      <InputContainer>
        <Input onChange={onChange} value={value} />
        <Button onClick={onClear}>
          <img width={22} height={22} src={Cross} alt="cross" />
        </Button>
      </InputContainer>
      <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
}

export default NodeInput;
