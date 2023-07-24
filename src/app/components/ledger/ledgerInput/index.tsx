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

const LedgerInputField = styled.input((props) => ({
  ...props.theme.body_medium_m,
  background: props.theme.colors.background['elevation-1'],
  border: `1px solid #303354`,
  borderRadius: '8px',
  padding: '10px 16px',
  color: props.theme.colors.white[0],
}));

interface Props {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function LedgerInput({ id, label, placeholder, value, onChange: handleChange }: Props) {
  return (
    <LedgerInputContainer>
      <LedgerInputLabel htmlFor={id}>{label}</LedgerInputLabel>
      <LedgerInputField
        type="text"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    </LedgerInputContainer>
  );
}

export default LedgerInput;
