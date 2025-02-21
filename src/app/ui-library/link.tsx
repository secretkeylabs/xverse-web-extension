import { ArrowRight } from '@phosphor-icons/react';
import { Link as RouterLink } from 'react-router-dom';
import styled, { css } from 'styled-components';
import type { Color, Typography } from 'theme';
import { StyledP } from './common.styled';

const BaseLinkStyles = css`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.space.xxxs};
  transition: opacity 0.1s ease;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &:active {
    color: ${(props) => props.theme.colors.tangerine_dark};
  }
`;

const StyledExternalLink = styled.a`
  ${BaseLinkStyles}
  color: ${(props) => props.theme.colors.tangerine_light};
`;

const StyledInternalLink = styled(RouterLink)`
  ${BaseLinkStyles}
  color: ${(props) => props.theme.colors.tangerine_light};
`;

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: React.ReactNode;
  showExternalIcon?: boolean;
  className?: string;
  typography?: Typography;
  color?: Color;
};

function Link({
  href,
  children,
  showExternalIcon = true,
  className,
  typography = 'body_medium_m',
  color,
  ...props
}: Props) {
  const isExternal = href.startsWith('http') || href.startsWith('https');
  const externalProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  const content = (
    <>
      {typeof children === 'string' ? (
        <StyledP typography={typography} color={color}>
          {children}
        </StyledP>
      ) : (
        children
      )}
      {isExternal && showExternalIcon && (
        <ArrowRight size={14} color="currentColor" weight="bold" />
      )}
    </>
  );

  if (isExternal) {
    return (
      <StyledExternalLink href={href} className={className} {...externalProps} {...props}>
        {content}
      </StyledExternalLink>
    );
  }

  return (
    <StyledInternalLink to={href} className={className} {...props}>
      {content}
    </StyledInternalLink>
  );
}

export default Link;
