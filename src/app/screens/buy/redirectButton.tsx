import CaretRight from '@assets/img/dashboard/caret_right.svg';
import styled from 'styled-components';

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

const Text = styled.h1<{ marginTop?: boolean }>((props) => ({
  ...props.theme.typography.body_bold_l,
  color: props.theme.colors.white_0,
  marginTop: props.marginTop ? props.theme.spacing(4) : 0,
}));

const SubText = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

const TextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginLeft: props.theme.spacing(8),
  textAlign: 'left',
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
});

interface Props {
  src: string;
  text: string;
  subText?: string;
  onClick: () => void;
}

function RedirectButton({ src, text, subText, onClick }: Props) {
  return (
    <Button onClick={onClick}>
      <RowContainer>
        <img src={src} alt={text} />
        <TextContainer>
          <Text marginTop={!subText}>{text}</Text>
          {subText && <SubText>{subText}</SubText>}
        </TextContainer>
      </RowContainer>
      <img src={CaretRight} alt="arrow" />
    </Button>
  );
}

export default RedirectButton;
