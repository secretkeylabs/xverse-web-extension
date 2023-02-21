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
  backgroundColor: props.warning ? props.theme.colors.feedback.error : props.theme.colors.action.classic,
  width: '100%',
  height: 44,
  opacity: props.disabled ? 0.6 : 1,
  transition: 'all 0.2s ease',
}));

const AnimatedButton = styled(Button)`
  :hover {
    background: ${(props) => (props.warning ? props.theme.colors.feedback.error : props.theme.colors.action.classicLight)};
    opacity: 0.6;
  }
  :focus {
    background: ${(props) => (props.warning ? props.theme.colors.feedback.error : props.theme.colors.action.classicLight)};
    opacity: 0.6;
  }
`;

const TransparentButton = styled(Button)`
  background-color: transparent;
  border: ${(props) => `1px solid ${props.theme.colors.background.elevation6}`}
`;

const AnimatedTransparentButton = styled(TransparentButton)`
:hover {
  background: ${(props) => props.theme.colors.background.elevation6_800};
}
:focus {
  background: ${(props) => props.theme.colors.action.classic800};
}
`;

const ButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: props.theme.colors.white['0'],
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
    if (!disabled) { onPress(); }
  };
  if (transparent) {
    return (
      <AnimatedTransparentButton
        onClick={handleOnPress}
        disabled={disabled}
      >
        {processing ? (
          <MoonLoader color="white" size={10} />
        ) : (
          <>
            <ButtonImage src={src} />
            <ButtonText>{text}</ButtonText>
          </>
        )}
      </AnimatedTransparentButton>
    );
  }

  return (
    <AnimatedButton
      onClick={handleOnPress}
      disabled={disabled}
      warning={warning}
    >
      {processing ? (
        <MoonLoader color="white" size={12} />
      ) : (
        <>
          <ButtonImage src={src} />
          <ButtonText>{text}</ButtonText>
        </>
      )}
    </AnimatedButton>
  );
}
export default ActionButton;
