import { CheckCircle, Info, Warning, WarningCircle } from '@phosphor-icons/react';
import { createElement } from 'react';
import styled from 'styled-components';
import Theme from 'theme';
import { StyledP } from './common.styled';

type FeedbackVariant = 'info' | 'danger';

const colors = {
  info: Theme.colors.white_200,
  danger: Theme.colors.danger_light,
};
const getColorForVariant = (variant: FeedbackVariant) => colors[variant];

const icons = {
  info: Info,
  warning: WarningCircle,
  success: CheckCircle,
  danger: Warning,
};
const getIconForVariant = (variant: FeedbackVariant) =>
  createElement(icons[variant], {
    weight: 'fill',
    size: '16',
    color: 'currentColor',
  });

const Feedback = styled.div<{ variant: FeedbackVariant }>`
  display: flex;
  gap: ${(props) => props.theme.spacing(2)}px;
  color: ${(props) => getColorForVariant(props.variant)};
`;

export const isDangerFeedback = (inputFeedback: InputFeedbackProps | null): boolean =>
  inputFeedback?.variant === 'danger';

/**
 * ref: https://zeroheight.com/0683c9fa7/p/76af35-form/t/29319e
 */
export type InputFeedbackProps = {
  message: string;
  variant?: FeedbackVariant;
};

export function InputFeedback({ message, variant = 'info' }: InputFeedbackProps) {
  return (
    <Feedback variant={variant}>
      {message && <div>{getIconForVariant(variant)}</div>}
      <StyledP typography="body_medium_s">{message}</StyledP>
    </Feedback>
  );
}
export default InputFeedback;
