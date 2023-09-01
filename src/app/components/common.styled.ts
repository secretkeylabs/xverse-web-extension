import styled from 'styled-components';
import Theme from 'theme';

type Typography = keyof typeof Theme.typography;
type Color = keyof typeof Theme.colors;
type TypographyProps = { typography: Typography; color?: Color };

/**
 * Typography
 *
 * Usage:
 *   <StyledHeading typography="headling_l">My heading</StyledHeading>
 *   <StyledP typography="body_m" color="white_200">My paragraph text</StyledP>
 *
 * ref: https://zeroheight.com/0683c9fa7/p/789eec-typography
 */
export const StyledP = styled.p<TypographyProps>`
  ${(props) => props.theme[props.typography]}
  color: ${(props) => (props.color ? props.theme.colors[props.color] : 'inherit')}
`;

export const StyledHeading = styled.h1<TypographyProps>`
  ${(props) => props.theme.typography[props.typography]}
  color: ${(props) => (props.color ? props.theme.colors[props.color] : 'inherit')}
`;

/**
 * Common Layouts
 *
 * ref: https://zeroheight.com/0683c9fa7/p/5270b4-button/b/004697
 */
export const VerticalStackButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(6)}px;
`;
