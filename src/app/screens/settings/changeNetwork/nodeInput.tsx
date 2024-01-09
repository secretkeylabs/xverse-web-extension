import { XCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

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
  color: props.theme.colors.white_200,
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
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  marginTop: props.theme.space.s,
  marginBottom: props.theme.space.s,
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
  color: props.theme.colors.white_200,
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
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const theme = useTheme();

  return (
    <div>
      <NodeInputHeader>
        <NodeText>{label}</NodeText>
        <NodeResetButton onClick={onReset}>{t('RESET_TO_DEFAULT')}</NodeResetButton>
      </NodeInputHeader>
      <InputContainer>
        <Input onChange={onChange} value={value} />
        <Button onClick={onClear}>
          <XCircle size={18} weight="fill" color={theme.colors.white_200} />
        </Button>
      </InputContainer>
      <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
}

export default NodeInput;
