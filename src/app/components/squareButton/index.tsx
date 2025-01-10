import styled from 'styled-components';

const Button = styled.button<{
  $isTransparent?: boolean;
  $hasText?: boolean;
  $radiusSize?: number;
}>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: props.$radiusSize ? props.$radiusSize : '16px',
  borderColor: 'transparent',
  rowGap: props.$hasText ? '8px' : '0px',
  backgroundColor: 'transparent',
  ':not(:disabled):hover > div': {
    backgroundColor: props.$isTransparent
      ? props.theme.colors.background.elevation6_800
      : props.theme.colors.action.classicLight,
    opacity: 0.6,
  },
  ':disabled': {
    cursor: 'not-allowed',
    '& > div': {
      backgroundColor: props.theme.colors.white_600,
      borderColor: 'transparent',
      color: props.theme.colors.elevation0,
    },
    '& > span': {
      color: props.theme.colors.white_600,
    },
  },
}));

const Icon = styled.img`
  width: 20px;
  height: 20px;
`;

const Wrapper = styled.div<{ $isTransparent?: boolean; $size?: number }>((props) => ({
  display: 'flex',
  width: props.$size ? props.$size : 48,
  height: props.$size ? props.$size : 48,
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
  borderRadius: 'inherit',
  backgroundColor: props.$isTransparent ? 'transparent' : props.theme.colors.action.classic,
  border: `1px solid ${
    props.$isTransparent ? props.theme.colors.white_800 : props.theme.colors.action.classic
  }`,
}));

const Title = styled.span((props) => ({
  ...props.theme.typography.body_medium_s,
  lineHeight: '140%',
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

const IconContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

type Props = {
  text?: string;
  onPress: () => void;
  src?: string;
  icon?: JSX.Element;
  isTransparent?: boolean;
  hoverDialogId?: string;
  size?: number;
  radiusSize?: number;
  disabled?: boolean;
};

function SquareButton({
  src,
  text,
  icon,
  onPress,
  isTransparent,
  hoverDialogId,
  size,
  radiusSize,
  disabled,
}: Props) {
  return (
    <Button
      disabled={disabled}
      onClick={disabled ? undefined : onPress}
      $hasText={!!text}
      $radiusSize={radiusSize}
    >
      <Wrapper id={hoverDialogId} $isTransparent={isTransparent} $size={size}>
        {src && <Icon src={src} alt={text} />}
        {icon && <IconContainer>{icon}</IconContainer>}
      </Wrapper>
      <Title>{text}</Title>
    </Button>
  );
}

export default SquareButton;
