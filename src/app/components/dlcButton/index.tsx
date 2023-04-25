import styled from 'styled-components';

interface ButtonProps {
  disabled?: boolean;
}

const Button = styled.button<ButtonProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%',
  height: 88,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(11),
  padding: props.theme.spacing(6),
  borderRadius: props.theme.radius(1),
  border:' 1px solid rgba(0,0,0,0)',
  background: 'linear-gradient(to right, #93009E, #001FBA, #04BAB2, #2C039E)',
  backgroundSize: '400%',
  backgroundPosition: 'left',
  transition: 'background-position 500ms ease, border-color 500ms ease, color 500ms ease',
  '&:hover': {
    backgroundPosition: 'right',
    borderColor:'#07E8D8',
    color: '#07E8D8',
  },
}));

const ButtonContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
`;

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  paddingBottom: props.theme.spacing(2),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.headline_m,
  fontWeight: 600,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonSubText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 400,
  color: 'inherit',
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  color: 'inherit',
  alignSelf: 'center',
  transform: 'all',
}));

interface Props {
  src?: string;
  text: string;
  onPress: () => void;
  disabled?: boolean;
}

function DLCActionButton({ src, text, onPress, disabled = false }: Props) {
  const handleOnPress = () => {
    if (!disabled) {
      onPress();
    }
  };

  return (
    <Button onClick={handleOnPress} disabled={disabled}>
      <ButtonContentContainer>
        <RowContainer>
          {src && <ButtonImage src={src} />}
          <ButtonText>{text}</ButtonText>
        </RowContainer>
        <ButtonSubText>powered by DLC.Link</ButtonSubText>
      </ButtonContentContainer>
    </Button>
  );
}
export default DLCActionButton;
