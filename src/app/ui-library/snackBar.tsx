import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type ToastType = 'success' | 'error' | 'neutral';

interface ToastProps {
  text: string;
  type: ToastType;
  actionButtonText?: string;
  actionButtonCallback?: () => void;
}

const getBackgroundColor = (type: ToastType, theme: any): string => {
  const colors = {
    success: theme.colors.feedback.success,
    error: theme.colors.feedback.error,
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
  height: 44px;
  padding: 12px 20px;
  width: auto;
  max-width: 306px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 80px;
`;

const ToastMessage = styled.h1<{ type: ToastType }>`
  ${({ theme }) => theme.typography.body_medium_m};
  color: ${(props) => getTextColor(props.type, props.theme)};
  margin-right: 24px;
`;

const ToastDismissButton = styled.h1<{ type: ToastType }>`
  ${({ theme }) => theme.typography.body_medium_m};
  color: ${(props) => getTextColor(props.type, props.theme)};
  background: transparent;
  cursor: pointer;
`;

export function SnackBar({ text, type, actionButtonText, actionButtonCallback }: ToastProps) {
  const { t } = useTranslation('translation');

  const dismissToast = () => {
    actionButtonCallback?.();
    toast.dismiss();
  };

  return (
    <ToastContainer type={type}>
      <ToastMessage type={type}>{text}</ToastMessage>
      <ToastDismissButton onClick={dismissToast} type={type}>
        {actionButtonText ?? t('OK')}
      </ToastDismissButton>
    </ToastContainer>
  );
}

export default SnackBar;
