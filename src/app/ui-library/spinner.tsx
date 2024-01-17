import styled, { useTheme } from 'styled-components';

type StyleProps = {
  size?: number;
  width?: number;
  color?: string;
};

type StyleProps$ = {
  // this is a copy of the Props with each key prefixed with a $ sign
  [key in keyof StyleProps as key extends string ? `$${key}` : never]: StyleProps[key];
};

const SpinnerElement = styled.span<StyleProps$>`
  @keyframes spinner-animation {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  border-width: ${(props) => props.$width}px;

  border-radius: 100%;
  border-style: solid;
  border-color: ${(props) => `${props.$color} ${props.$color}`} transparent;
  border-image: initial;
  display: inline-block;

  animation: 0.75s linear 0s infinite normal both running spinner-animation;
`;

type Props = StyleProps & {
  className?: string;
};

function Spinner({ className, size = 14, width = 1.5, color }: Props) {
  const theme = useTheme();
  return (
    <SpinnerElement
      className={className}
      $size={size}
      $width={width}
      $color={color ?? theme.colors.white_0}
    />
  );
}

export default Spinner;
