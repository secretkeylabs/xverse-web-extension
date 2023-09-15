import { createElement } from 'react';
import { CheckCircle, Info, Warning, WarningCircle } from '@phosphor-icons/react';
import styled from 'styled-components';
import Theme from 'theme';
import { StyledHeading, StyledP } from './common.styled';

type CalloutVariant = 'info' | 'warning' | 'danger' | 'success';

const backgroundColors = {
  info: Theme.colors.elevation6_600,
  warning: Theme.colors.caution_800,
  success: Theme.colors.success_medium_700,
  danger: Theme.colors.danger_dark_600,
};
const getBackgroundForVariant = (variant: CalloutVariant) => backgroundColors[variant];

const icons = {
  info: Info,
  warning: WarningCircle,
  success: CheckCircle,
  danger: Warning,
};
const getIconForVariant = (variant: CalloutVariant) =>
  createElement(icons[variant], {
    weight: 'fill',
    size: '24',
    color: Theme.colors.white_200,
  });

const Container = styled.div<{ variant: CalloutVariant }>`
  display: flex;
  flex-direction: row;
  border-radius: ${(props) => props.theme.radius(2)}px;
  align-items: flex-start;
  background-color: ${(props) => getBackgroundForVariant(props.variant)};
  padding: ${(props) => props.theme.spacing(8)}px;
  gap: ${(props) => props.theme.spacing(8)}px;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RedirectButton = styled.button((props) => ({
  backgroundColor: 'transparent',
  color: props.theme.colors.white['0'],
  display: 'flex',
  marginTop: 4,
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}));

/**
 * ref: https://zeroheight.com/0683c9fa7/p/051ca8-callout/t/7814dc
 */
export type CalloutProps = {
  titleText?: string;
  bodyText: string;
  variant?: CalloutVariant;
  redirectText?: string;
  onClickRedirect?: () => void;
};
export function Callout({
  titleText,
  bodyText,
  variant = 'info',
  redirectText,
  onClickRedirect = () => {},
}: CalloutProps) {
  const icon = getIconForVariant(variant);
  return (
    <Container variant={variant}>
      <div>{icon}</div>
      <TextContainer>
        {titleText && (
          <StyledHeading typography="body_bold_m" color="white_0">
            {titleText}
          </StyledHeading>
        )}
        <StyledP typography="body_m" color="white_200">
          {bodyText}
        </StyledP>
        {redirectText && (
          <RedirectButton onClick={onClickRedirect}>
            <StyledP typography="body_medium_m" color="white_0">{`${redirectText} →`}</StyledP>
          </RedirectButton>
        )}
      </TextContainer>
    </Container>
  );
}

export default Callout;
