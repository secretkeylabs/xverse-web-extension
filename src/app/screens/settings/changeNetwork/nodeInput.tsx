import { XCircle } from '@phosphor-icons/react';
import { InputFeedback } from '@ui-library/inputFeedback';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

const NodeInputHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  padding-left: ${(props) => props.theme.spacing(1)};
  padding-right: ${(props) => props.theme.spacing(1)};
`;

const NodeText = styled.label`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

const NodeResetButton = styled.button`
  ${(props) => props.theme.typography.body_medium_m}
  background: none;
  color: ${(props) => props.theme.colors.tangerine};
`;

// TODO create and use a ui-library input with proper input box styling
const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  border: 1px solid ${(props) => props.theme.colors.elevation3};
  background-color: ${(props) => props.theme.colors.elevation_n1};
  border-radius: ${(props) => props.theme.radius(1)}px;
  padding-left: ${(props) => props.theme.space.m};
  padding-right: ${(props) => props.theme.space.m};
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.s};
`;

const Input = styled.input`
  ${(props) => props.theme.typography.body_medium_m}
  height: 44px;
  display: flex;
  flex: 1;
  background-color: ${(props) => props.theme.colors.elevation_n1};
  color: ${(props) => props.theme.colors.white_200};
  border: none;
`;

const Button = styled.button`
  background: none;
`;

function NodeInput({
  label,
  onChange,
  value,
  onClear,
  onReset,
  error,
  disabled,
}: {
  label: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  onClear: () => void;
  onReset: () => void;
  error: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const theme = useTheme();

  return (
    <div>
      <NodeInputHeader>
        <NodeText>{label}</NodeText>
        <NodeResetButton onClick={onReset} disabled={disabled}>
          {t('RESET_TO_DEFAULT')}
        </NodeResetButton>
      </NodeInputHeader>
      <InputContainer>
        <Input data-testid={label} onChange={onChange} value={value} disabled={disabled} />
        {value && (
          <Button onClick={onClear} disabled={disabled}>
            <XCircle size={18} weight="fill" color={theme.colors.white_200} />
          </Button>
        )}
      </InputContainer>
      <InputFeedback variant="danger" message={error} />
    </div>
  );
}

export default NodeInput;
