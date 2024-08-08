import { CheckCircle, XCircle } from '@phosphor-icons/react';
import styled from 'styled-components';

type ToastType = 'success' | 'error' | 'neutral';

interface ToastProps {
  text: string;
  type: ToastType;
  dismissToast?: () => void;
  action?: { text: string; onClick: () => void };
}

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
  flex-direction: row;
  background: ${(props) => getBackgroundColor(props.type, props.theme)};
  border-radius: 12px;
  box-shadow: 0px 7px 16px -4px rgba(25, 25, 48, 0.25);
  min-height: 44px;
  padding: 12px 20px;
  width: auto;
  max-width: 328px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 80px;
`;

const ToastMessage = styled.h1<{ type: ToastType }>`
  ${({ theme }) => theme.typography.body_medium_m};
  color: ${(props) => getTextColor(props.type, props.theme)};
  margin-left: ${(props) => props.theme.space.s};
  margin-right: ${(props) => props.theme.space.l};
`;

const ToastDismissButton = styled.h1<{ type: ToastType }>`
  ${({ theme }) => theme.typography.body_medium_m};
  color: ${(props) => getTextColor(props.type, props.theme)};
  background: transparent;
  cursor: pointer;
`;

function SnackBar({ text, type, dismissToast, action }: ToastProps) {
  return (
    <ToastContainer type={type}>
      {type !== 'neutral' && dismissToast && (
        <ToastDismissButton onClick={dismissToast} type={type}>
          {type === 'error' && <XCircle size={20} />}
          {type === 'success' && <CheckCircle size={20} />}
        </ToastDismissButton>
      )}

      <ToastMessage type={type}>{text}</ToastMessage>

      {action?.text && (
        <ToastDismissButton onClick={action?.onClick} type={type}>
          {action?.text}
        </ToastDismissButton>
      )}
    </ToastContainer>
  );
}

export default SnackBar;
