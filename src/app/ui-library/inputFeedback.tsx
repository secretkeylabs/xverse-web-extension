import { CheckCircle, Info, Warning, type Icon } from '@phosphor-icons/react';
import styled from 'styled-components';
import Theme from 'theme';
import { StyledP } from './common.styled';

export type FeedbackVariant = 'info' | 'danger' | 'explicative' | 'plainIndented' | 'checkmark';

const colors: Record<FeedbackVariant, string> = {
  info: Theme.colors.white_200,
  danger: Theme.colors.danger_light,
  explicative: Theme.colors.white_400,
  plainIndented: Theme.colors.white_200,
  checkmark: Theme.colors.success_light,
};
const getColorForVariant = (variant: FeedbackVariant) => colors[variant];

const getStyledIcon = (icon: Icon) => styled(icon)`
  flex-shrink: 0;
  flex-grow: 0;
`;
const icons: Record<FeedbackVariant, ReturnType<typeof getStyledIcon> | undefined> = {
  info: getStyledIcon(Info),
  danger: getStyledIcon(Warning),
  explicative: undefined,
  plainIndented: undefined,
  checkmark: getStyledIcon(CheckCircle),
};

const Feedback = styled.div<{ variant: FeedbackVariant }>`
  display: flex;
  gap: ${(props) => props.theme.space.xxs};
  color: ${(props) => getColorForVariant(props.variant)};
`;

const Indent = styled.div`
  width: 16px;
`;

const Message = styled(StyledP)`
  word-break: break-word;
`;

export const isDangerFeedback = (inputFeedback: InputFeedbackProps | null): boolean =>
  inputFeedback?.variant === 'danger';

/**
 * ref: https://zeroheight.com/0683c9fa7/p/76af35-form/t/29319e
 */
export type InputFeedbackProps = {
  className?: string;
  message: string;
  variant?: FeedbackVariant;
};

export function InputFeedback({ className, message, variant = 'info' }: InputFeedbackProps) {
  const IconVariant = icons[variant];
  return (
    <Feedback className={className} variant={variant}>
      {message && IconVariant && <IconVariant weight="fill" size={16} color="currentColor" />}
      {message && variant === 'plainIndented' && <Indent />}
      <Message typography="body_medium_s">{message}</Message>
    </Feedback>
  );
}
