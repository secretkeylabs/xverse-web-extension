import styled from 'styled-components';
import { Ring } from 'react-spinners-css';

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: props.alignment ?? 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.color ?? props.theme.colors.action.classic,
  width: '100%',
  padding: '12px 16px 12px 10px',
  border:`1px solid ${props.border}`,
  marginRight:props.theme.spacing(props.margin),
  marginLeft:props.theme.spacing(props.margin),
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
  disabled?: boolean;
  processing?: boolean;
  buttonColor?: string;
  buttonAlignment?: string;
  margin?:number
}

const ActionButton: React.FC<Props> = ({
  src,
  text,
  onPress,
  buttonBorderColor,
  disabled,
  processing = false,
  buttonColor,
  buttonAlignment,
  margin
}) => {
  return (
    <Button onClick={onPress} color={buttonColor} alignment={buttonAlignment} border={buttonBorderColor} margin={margin}>
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
};
export default ActionButton;
