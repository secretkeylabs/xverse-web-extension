import CaretRight from '@assets/img/dashboard/caret_right.svg';
import styled from 'styled-components';

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(2),
  backgroundColor: 'transparent',
  padding: props.theme.space.m,
  marginBottom: props.theme.space.s,
  border: `1px solid ${props.theme.colors.white_900}`,
  transition: 'background-color 0.1s ease',
  '&:hover': {
    backgroundColor: props.theme.colors.white_900,
  },
}));

const Text = styled.p((props) => ({
  ...props.theme.typography.body_bold_l,
  color: props.theme.colors.white_0,
}));

const SubText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

const TextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: props.theme.space.xxxs,
  flex: 1,
  marginLeft: props.theme.space.m,
  textAlign: 'left',
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
});

type Props = {
  src: string;
  text: string;
  subText?: string;
  onClick: () => void;
};

function RedirectButton({ src, text, subText, onClick }: Props) {
  return (
    <Button onClick={onClick}>
      <RowContainer>
        <img src={src} alt={text} />
        <TextContainer>
          <Text>{text}</Text>
          {subText && <SubText>{subText}</SubText>}
        </TextContainer>
      </RowContainer>
      <img src={CaretRight} alt="arrow" />
    </Button>
  );
}

export default RedirectButton;
