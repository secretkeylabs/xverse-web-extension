import styled from 'styled-components';

interface ButtonProps {
  isOpaque?: boolean;
}
const Button = styled.div<ButtonProps>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 14,
  backgroundColor: props.isOpaque ? props.theme.colors.background.elevation2 : props.theme.colors.action.classic,
  width: 48,
  height: 48,
  transition: 'all 0.2s ease',
  ':hover': {
    background: props.isOpaque ?props.theme.colors.background.elevation2 : props.theme.colors.action.classicLight,
    opacity: props.isOpaque ? 0.85 : 0.6 ,
  }
}));

const TransparentButton = styled(Button)`
  background-color: transparent;
  border: ${(props) => `1px solid ${props.theme.colors.background.elevation6}`}
`;

const AnimatedTransparentButton = styled(TransparentButton)`
:hover {
  background: ${(props) => props.theme.colors.background.elevation6_800};
}
`;

const ButtonText = styled.h1((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  marginTop: props.theme.spacing(4),
  color: 'rgba(255, 255, 255, 0.9)',
}));

const ButtonImage = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const ButtonContainer = styled.button({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  background: 'transparent',
});

interface Props {
  src?: string;
  text: string;
  onPress: () => void;
  isOpaque?: boolean;
}

function SmallActionButton({
  src,
  text,
  onPress,
  isOpaque,
}: Props) {
  const handleOnPress = () => {
    onPress();
  };

  return (
    <ButtonContainer onClick={handleOnPress}>
      <Button isOpaque={isOpaque}>
        { src && <ButtonImage src={src} />}
      </Button>
      <ButtonText>{text}</ButtonText>
    </ButtonContainer>
  );
}
export default SmallActionButton;
