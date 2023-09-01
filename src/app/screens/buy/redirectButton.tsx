import styled from 'styled-components';
import CaretRight from '@assets/img/dashboard/caret_right.svg';

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  backgroundColor: 'transparent',
  padding: props.theme.spacing(8),
  marginBottom: props.theme.spacing(8),
  border: `1px solid ${props.theme.colors.elevation3}`,
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  marginLeft: props.theme.spacing(8),
  marginTop: props.theme.spacing(4),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
});

interface Props {
  src: string;
  text: string;
  onClick: () => void;
}

function RedirectButton({ src, text, onClick }: Props) {
  return (
    <Button onClick={onClick}>
      <RowContainer>
        <img src={src} alt={text} />
        <Text>{text}</Text>
      </RowContainer>
      <img src={CaretRight} alt="arrow" />
    </Button>
  );
}

export default RedirectButton;
