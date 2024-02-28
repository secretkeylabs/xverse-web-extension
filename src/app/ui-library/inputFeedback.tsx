import { CheckCircle, Icon, Info, Warning } from '@phosphor-icons/react';
import styled from 'styled-components';
import Theme from 'theme';
import { StyledP } from './common.styled';

export type FeedbackVariant = 'info' | 'danger' | 'plain' | 'plainIndented' | 'checkmark';

const colors: Record<FeedbackVariant, string> = {
  info: Theme.colors.white_200,
  danger: Theme.colors.danger_light,
  plain: Theme.colors.white_400,
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
  plain: undefined,
  plainIndented: undefined,
  checkmark: getStyledIcon(CheckCircle),
};

const Feedback = styled.div<{ variant: FeedbackVariant }>`
  display: flex;
  gap: ${(props) => props.theme.spacing(2)}px;
  color: ${(props) => getColorForVariant(props.variant)};
`;

const Indent = styled.div`
  width: 16px;
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
      <StyledP typography="body_medium_s">{message}</StyledP>
    </Feedback>
  );
}
export default InputFeedback;
