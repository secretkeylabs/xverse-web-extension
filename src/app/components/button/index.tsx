import styled from 'styled-components';
import { MoonLoader } from 'react-spinners';

interface ButtonProps {
  disabled?: boolean;
  warning?: boolean;
}

const Button = styled.button<ButtonProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.warning
    ? props.theme.colors.feedback.error
    : props.theme.colors.action.classic,
  width: '100%',
  height: 44,
  transition: 'all 0.1s ease',
  ':disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  ':hover:enabled': {
    opacity: 0.8,
  },
  ':active:enabled': {
    opacity: 0.6,
  },
}));

const TransparentButton = styled(Button)((props) => ({
  border: `1px solid ${props.theme.colors.elevation6}`,
  backgroundColor: 'transparent',
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.4,
  },
  ':hover:enabled': {
    backgroundColor: props.theme.colors.elevation6_800,
  },
  ':active:enabled': {
    backgroundColor: props.theme.colors.elevation6_600,
  },
}));

interface TextProps {
  warning?: boolean;
}

const ButtonText = styled.h1<TextProps>((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: `${props.warning ? props.theme.colors.white_0 : props.theme.colors.elevation0}`,
  textAlign: 'center',
}));

const AnimatedButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const ButtonIconContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: props.theme.spacing(3),
}));

interface Props {
  src?: string;
  icon?: JSX.Element;
  text: string;
  onPress: () => void;
  processing?: boolean;
  disabled?: boolean;
  transparent?: boolean;
  warning?: boolean;
}

function ActionButton({
  src,
  icon,
  text,
  onPress,
  processing = false,
  disabled = false,
  transparent,
  warning,
}: Props) {
  const handleOnPress = () => {
    if (!disabled) {
      onPress();
    }
  };

  if (transparent) {
    return (
      <TransparentButton onClick={handleOnPress} disabled={disabled || processing}>
        {processing ? (
          <MoonLoader color="white" size={10} />
        ) : (
          <>
            {src && <ButtonImage src={src} />}
            {icon && <ButtonIconContainer>{icon}</ButtonIconContainer>}
            <AnimatedButtonText>{text}</AnimatedButtonText>
          </>
        )}
      </TransparentButton>
    );
  }

  return (
    <Button onClick={handleOnPress} disabled={disabled || processing} warning={warning}>
      {processing ? (
        <MoonLoader color="#12151E" size={12} />
      ) : (
        <>
          {src && <ButtonImage src={src} />}
          {icon && <ButtonIconContainer>{icon}</ButtonIconContainer>}
          <ButtonText warning={warning}>{text}</ButtonText>
        </>
      )}
    </Button>
  );
}
export default ActionButton;
