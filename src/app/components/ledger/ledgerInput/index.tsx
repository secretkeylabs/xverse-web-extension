import styled from 'styled-components';

const LedgerInputContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}));

const LedgerInputLabel = styled.label((props) => ({
  ...props.theme.body_medium_m,
}));

interface LedgerInputFieldProps {
  error?: boolean;
}
const LedgerInputField = styled.input<LedgerInputFieldProps>((props) => ({
  ...props.theme.body_medium_m,
  background: props.theme.colors.background.elevation_1,
  border: `1px solid ${props.error ? props.theme.colors.feedback.error : '#303354'}`,
  borderRadius: '8px',
  padding: '10px 16px',
  color: props.theme.colors.white[0],
  transition: 'border 0.2s ease',
}));

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
  fontWeight: 600,
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
    <LedgerInputContainer>
      <LedgerInputLabel htmlFor={id}>{label}</LedgerInputLabel>
      <LedgerInputField
        type="text"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        error={!!error}
      />
      {!!error && <ErrorText>{error}</ErrorText>}
    </LedgerInputContainer>
  );
}

export default LedgerInput;
