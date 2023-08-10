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
  ...(props.disabled
    ? {
        cursor: 'not-allowed',
        opacity: 0.4,
      }
    : {
        ':hover': { opacity: 0.8 },
        ':active': { opacity: 0.6 },
      }),
}));

const TransparentButton = styled(Button)((props) => ({
  border: `1px solid ${props.theme.colors.background.elevation6}`,
  backgroundColor: 'transparent',
  ...(props.disabled
    ? {
        cursor: 'not-allowed',
        opacity: 0.4,
      }
    : {
        ':hover': {
          backgroundColor: props.theme.colors.background.elevation6_800,
        },
        ':active': {
          backgroundColor: props.theme.colors.background.elevation6_600,
        },
      }),
}));

interface TextProps {
  warning?: boolean;
}

const ButtonText = styled.h1<TextProps>((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: `${
    props.warning ? props.theme.colors.white[0] : props.theme.colors.background.elevation0
  }`,
  textAlign: 'center',
}));

const AnimatedButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: props.theme.colors.white[0],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

interface Props {
  src?: string;
  text: string;
  onPress: () => void;
  processing?: boolean;
  disabled?: boolean;
  transparent?: boolean;
  warning?: boolean;
}

function ActionButton({
  src,
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
          <ButtonText warning={warning}>{text}</ButtonText>
        </>
      )}
    </Button>
  );
}
export default ActionButton;
