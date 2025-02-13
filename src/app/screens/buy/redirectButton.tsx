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
  border: `1px solid ${props.theme.colors.white_850}`,
  transition: 'background-color 0.1s ease',
  '&:hover': {
    backgroundColor: props.theme.colors.white_950,
  },
}));

const Text = styled.p<{ $typography?: string }>((props) => ({
  ...props.theme.typography[props.$typography || 'body_bold_l'],
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

const ImageContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

type Props = {
  src: string;
  text: string;
  subText?: string;
  onClick: () => void;
  titleTypography?: string;
};

function RedirectButton({ src, text, subText, onClick, titleTypography }: Props) {
  return (
    <Button onClick={onClick}>
      <RowContainer>
        <ImageContainer>
          <img src={src} height={40} width={40} alt={text} />
        </ImageContainer>
        <TextContainer>
          <Text $typography={titleTypography}>{text}</Text>
          {subText && <SubText>{subText}</SubText>}
        </TextContainer>
      </RowContainer>
      <img src={CaretRight} alt="arrow" />
    </Button>
  );
}

export default RedirectButton;
