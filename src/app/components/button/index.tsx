import styled from 'styled-components';
import { Ring } from 'react-spinners-css';

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
  padding: '12px 16px 12px 10px',
  opacity: props.disabled ? 0.6 : 1,
}));

const TransparentButton = styled(Button)`
  background-color: transparent;
  border: 1px solid #4C5187;
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
      <TransparentButton
        onClick={handleOnPress}
        disabled={disabled}
      >
        {processing ? (
          <Ring color="white" size={20} />
        ) : (
          <>
            <ButtonImage src={src} />
            <ButtonText>{text}</ButtonText>
          </>
        )}
      </TransparentButton>
    );
  }

  return (
    <Button
      onClick={handleOnPress}
      disabled={disabled}
      warning={warning}
    >
      {processing ? (
        <Ring color="white" size={20} />
      ) : (
        <>
          <ButtonImage src={src} />
          <ButtonText>{text}</ButtonText>
        </>
      )}
    </Button>
  );
}
export default ActionButton;
