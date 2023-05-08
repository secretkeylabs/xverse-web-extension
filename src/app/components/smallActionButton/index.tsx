import styled from 'styled-components';
import { MoonLoader } from 'react-spinners';

const Button = styled.button((props) => ({
  borderRadius: 14,
  backgroundColor: props.theme.colors.action.classic,
  width: 48,
  height: 48,
  opacity: props.disabled ? 0.6 : 1,
  transition: 'all 0.2s ease',
}));

const AnimatedButton = styled(Button)`
  :hover {
    background: ${(props) => (props.theme.colors.action.classicLight)};
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
`;

const ButtonText = styled.h1((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  marginTop: props.theme.spacing(4),
  color: 'rgba(255, 255, 255, 0.9)',
}));

const AnimatedButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: props.theme.colors.white[0],
  textAlign: 'center',
}));

const ButtonImage = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const ButtonContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 0,
});

interface Props {
  src?: string;
  text: string;
  onPress: () => void;
  transparent?: boolean;
}

function SmallActionButton({
  src,
  text,
  onPress,
  transparent,
}: Props) {
  const handleOnPress = () => {
    onPress();
  };

  return (
    <ButtonContainer>
      <AnimatedButton
        onClick={handleOnPress}
      >
        { src && <ButtonImage src={src} />}
      </AnimatedButton>
      <ButtonText>{text}</ButtonText>
    </ButtonContainer>
  );
}
export default SmallActionButton;
