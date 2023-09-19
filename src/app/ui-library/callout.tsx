import { ArrowRight, CheckCircle, Info, Warning, WarningCircle, Icon } from '@phosphor-icons/react';
import styled from 'styled-components';
import Theme from 'theme';
import { StyledHeading, StyledP } from './common.styled';

type CalloutVariant = 'info' | 'warning' | 'danger' | 'success';

const backgroundColors = {
  info: Theme.colors.elevation6_600,
  warning: Theme.colors.caution_800,
  success: Theme.colors.success_dark_600,
  danger: Theme.colors.danger_dark_600,
};
const getBackgroundForVariant = (variant: CalloutVariant) => backgroundColors[variant];

const icons: Record<CalloutVariant, Icon> = {
  info: Info,
  warning: WarningCircle,
  success: CheckCircle,
  danger: Warning,
};
const getIconForVariant = (variant: CalloutVariant) => styled(icons[variant])`
  flex-shrink: 0;
  flex-grow: 0;
  color: ${(props) => props.theme.colors.white_200};
`;

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
  gap: ${(props) => props.theme.spacing(2)}px;
`;

const BodySpan = styled.span`
  display: inline-block;
  vertical-align: middle;
`;

const RedirectButton = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: transparent;
  color: ${(props) => props.theme.colors.white_0};
  gap: ${(props) => props.theme.spacing(1)}px;
  text-transform: capitalize;
`;

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
  const IconVariant = getIconForVariant(variant);
  return (
    <Container variant={variant}>
      <IconVariant weight="fill" size={24} color="currentColor" />
      <TextContainer>
        {titleText && (
          <StyledHeading typography="body_bold_m" color="white_0">
            {titleText}
          </StyledHeading>
        )}
        <StyledP typography="body_m" color="white_200">
          <BodySpan>{bodyText}</BodySpan>
        </StyledP>
        {redirectText && (
          <RedirectButton onClick={onClickRedirect}>
            <StyledP typography="body_medium_m" color="white_0">
              {redirectText}
            </StyledP>
            <ArrowRight size={12} color="currentColor" />
          </RedirectButton>
        )}
      </TextContainer>
    </Container>
  );
}

export default Callout;
