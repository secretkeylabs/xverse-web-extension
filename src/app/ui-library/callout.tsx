import {
  ArrowRight,
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
  type Icon,
} from '@phosphor-icons/react';
import styled from 'styled-components';
import Theme from 'theme';
import { StyledHeading, StyledP } from './common.styled';
import CrossButton from './crossButton';

type CalloutVariant = 'info' | 'warning' | 'danger' | 'success';

const backgroundColors = {
  info: Theme.colors.elevation6_600,
  warning: Theme.colors.caution_800,
  success: Theme.colors.success_dark_600,
  danger: Theme.colors.danger_dark_600,
};
const getBackgroundForVariant = (variant: CalloutVariant) => backgroundColors[variant];

const getStyledIcon = (icon: Icon) => styled(icon)`
  color: ${(props) => props.theme.colors.white_200};
  flex-shrink: 0;
  flex-grow: 0;
`;
const icons = {
  info: getStyledIcon(Info),
  warning: getStyledIcon(WarningCircle),
  success: getStyledIcon(CheckCircle),
  danger: getStyledIcon(Warning),
};

const Container = styled.div<{ variant: CalloutVariant }>`
  position: relative;
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

const AnchorLink = styled.a((props) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: props.theme.space.xxxs,
  textTransform: 'capitalize',
  color: props.theme.colors.white_0,
}));

/**
 * ref: https://zeroheight.com/0683c9fa7/p/051ca8-callout/t/7814dc
 */
export type CalloutProps = {
  className?: string;
  titleText?: string;
  dataTestID?: string;
  bodyText: string | React.ReactNode;
  variant?: CalloutVariant;
  redirectText?: string;
  onClickRedirect?: () => void;
  onClose?: () => void;
  anchorRedirect?: string;
  hideIcon?: boolean;
};

function Callout({
  className,
  dataTestID,
  titleText,
  bodyText,
  variant = 'info',
  redirectText,
  onClickRedirect,
  onClose,
  anchorRedirect,
  hideIcon = false,
}: CalloutProps) {
  const StyledIcon = icons[variant];
  return (
    <Container className={className} variant={variant}>
      {!hideIcon && <StyledIcon size={24} weight="fill" color="currentColor" />}
      <TextContainer data-testid={dataTestID}>
        {titleText && (
          <StyledHeading typography="body_bold_m" color="white_0">
            {titleText}
          </StyledHeading>
        )}
        <StyledP typography="body_m" color="white_200">
          <BodySpan>{bodyText}</BodySpan>
        </StyledP>
        {redirectText && (
          <>
            {onClickRedirect && (
              <RedirectButton onClick={onClickRedirect}>
                <StyledP typography="body_medium_m" color="white_0">
                  {redirectText}
                </StyledP>
                <ArrowRight size={12} color="currentColor" weight="bold" />
              </RedirectButton>
            )}
            {anchorRedirect && (
              <AnchorLink href={anchorRedirect} target="_blank" rel="noopener noreferrer">
                <StyledP typography="body_medium_m">{redirectText}</StyledP>
                <ArrowRight size={12} color="currentColor" weight="bold" />
              </AnchorLink>
            )}
          </>
        )}
      </TextContainer>
      {onClose && <CrossButton onClick={onClose} />}
    </Container>
  );
}

export default Callout;
