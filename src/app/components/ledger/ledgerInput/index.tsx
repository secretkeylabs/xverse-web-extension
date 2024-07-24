import { InputFeedback } from '@ui-library/inputFeedback';
import styled from 'styled-components';

const Container = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const Label = styled.label((props) => ({
  ...props.theme.typography.body_medium_m,
}));

const InputField = styled.input<{
  error?: boolean;
}>((props) => ({
  ...props.theme.typography.body_medium_m,
  background: props.theme.colors.elevation_n1,
  border: `1px solid ${props.error ? props.theme.colors.feedback.error : '#303354'}`,
  borderRadius: '8px',
  padding: '10px 16px',
  color: props.theme.colors.white_0,
  transition: 'border 0.2s ease',
}));

interface Props {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function LedgerInput({ id, label, placeholder, value, error, onChange: handleChange }: Props) {
  return (
    <Container>
      <Label htmlFor={id}>{label}</Label>
      <InputField
        type="text"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        error={!!error}
      />
      {!!error && <InputFeedback message={error} variant="danger" />}
    </Container>
  );
}

export default LedgerInput;
