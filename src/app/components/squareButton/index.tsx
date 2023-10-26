import styled from 'styled-components';

const Icon = styled.img`
  width: 20px;
  height: 20px;
`;

interface ButtonProps {
  isTransparent?: boolean;
}

const Button = styled.button<ButtonProps>((props) => ({
  display: 'flex',
  width: 48,
  height: 48,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
  backgroundColor: props.isTransparent ? 'transparent' : props.theme.colors.action.classic,
  border: `1px solid ${
    props.isTransparent ? props.theme.colors.white_800 : props.theme.colors.action.classic
  }`,
  ':hover': {
    backgroundColor: props.isTransparent
      ? props.theme.colors.background.elevation6_800
      : props.theme.colors.action.classicLight,
    opacity: 0.6,
  },
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_s,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const ButtonIconContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 8px;
`;

interface Props {
  text: string;
  onPress: () => void;
  src?: string;
  icon?: JSX.Element;
  isTransparent?: boolean;
  hoverDialogId?: string;
}

function SquareButton({ src, text, icon, onPress, isTransparent, hoverDialogId }: Props) {
  return (
    <Container>
      <Button id={hoverDialogId} onClick={onPress} isTransparent={isTransparent}>
        {src && <Icon src={src} alt={text} />}
        {icon && <ButtonIconContainer>{icon}</ButtonIconContainer>}
      </Button>
      <ButtonText>{text}</ButtonText>
    </Container>
  );
}

export default SquareButton;
