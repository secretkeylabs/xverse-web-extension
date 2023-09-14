import styled from 'styled-components';

const Icon = styled.img`
  width: 20px;
  height: 20px;
`;

const Button = styled.button`
  display: flex;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  background-color: ${(props) => props.theme.colors.action.classic};
  :hover {
    background-color: ${(props) => props.theme.colors.action.classicLight};
    opacity: 0.6;
  }
`;

const ButtonText = styled.div((props) => ({
  fontFamily: 'Satoshi-Medium',
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 8px;
`;

interface Props {
  text: string;
  src: string;
  onPress: () => void;
}

function SquareButton({ src, text, onPress }: Props) {
  return (
    <Container>
      <Button onClick={onPress}>
        <Icon src={src} alt={text} />
      </Button>
      <ButtonText>{text}</ButtonText>
    </Container>
  );
}

export default SquareButton;
