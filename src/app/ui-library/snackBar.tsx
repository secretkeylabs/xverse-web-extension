import { CheckCircle, XCircle } from '@phosphor-icons/react';
import styled from 'styled-components';

type ToastType = 'success' | 'error' | 'neutral';

const getBackgroundColor = (type: ToastType, theme: any): string => {
  const colors = {
    success: theme.colors.feedback.success,
    error: theme.colors.danger_dark,
    neutral: theme.colors.white_0,
  };
  return colors[type] || theme.colors.feedback.neutral;
};

const getTextColor = (type: ToastType, theme: any): string => {
  const colors = {
    success: theme.colors.elevation0,
    error: theme.colors.white_0,
    neutral: theme.colors.elevation0,
  };
  return colors[type] || theme.colors.elevation0;
};

const ToastContainer = styled.div<{ type: ToastType }>`
  display: flex;
`;

const ToastMessage = styled.p<{ type: ToastType; addMarginRight: boolean }>`
  ${({ theme }) => theme.typography.body_medium_m};
  color: ${(props) => getTextColor(props.type, props.theme)};
`;

const ToastDismissButton = styled.div<{ type: ToastType }>`
  display: flex;
  ${({ theme }) => theme.typography.body_medium_m};
  color: ${(props) => getTextColor(props.type, props.theme)};
  background: transparent;
  cursor: pointer;
  margin-right: ${(props) => props.theme.space.s};
`;

const ToastActionButton = styled(ToastDismissButton)`
  margin-left: ${(props) => props.theme.space.l};
  margin-right: 0;
`;

type Props = {
  text: string;
  type: ToastType;
  dismissToast?: () => void;
  action?: { text: string; onClick: () => void };
};

function SnackBar({ text, type, dismissToast, action }: Props) {
  return (
    <ToastContainer type={type}>
      {type !== 'neutral' && dismissToast && (
        <ToastDismissButton onClick={dismissToast} type={type}>
          {type === 'error' && <XCircle size={20} />}
          {type === 'success' && <CheckCircle size={20} />}
        </ToastDismissButton>
      )}

      <ToastMessage type={type} addMarginRight={Boolean(action)}>
        {text}
      </ToastMessage>

      {action?.text && (
        <ToastActionButton onClick={action?.onClick} type={type}>
          {action?.text}
        </ToastActionButton>
      )}
    </ToastContainer>
  );
}

export default SnackBar;
