import styled from 'styled-components';
import { Ring } from 'react-spinners-css';

interface ButtonProps {
  alignment?: string;
  border?: string;
  margin: number;
  disabled?: boolean;
}

const Button = styled.button<ButtonProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: props.alignment ?? 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.color ?? props.theme.colors.action.classic,
  width: '100%',
  padding: '12px 16px 12px 10px',
  border: `1px solid ${props.border}`,
  marginRight: props.theme.spacing(props.margin),
  marginLeft: props.theme.spacing(props.margin),
  opacity: props.disabled ? 0.6 : 1,
}));

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
  buttonBorderColor?: string;
  processing?: boolean;
  disabled?: boolean;
  buttonColor?: string;
  buttonAlignment?: string;
  margin?: number;
}

function ActionButton({
  src,
  text,
  onPress,
  buttonBorderColor,
  processing = false,
  disabled = false,
  buttonColor,
  buttonAlignment,
  margin,
}: Props) {
  const handleOnPress = () => {
    if (!disabled) { onPress(); }
  };

  return (
    <Button
      onClick={handleOnPress}
      color={buttonColor}
      alignment={buttonAlignment}
      border={buttonBorderColor}
      margin={margin ?? 0}
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
    </Button>
  );
}
export default ActionButton;
