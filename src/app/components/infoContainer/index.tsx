import styled from 'styled-components';
import InfoIcon from '@assets/img/info.svg';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  borderRadius: 12,
  alignItems: 'flex-start',
  backgroundColor: 'transparent',
  padding: props.theme.spacing(8),
  marginBottom: props.theme.spacing(6),
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const TextContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
}));

const BoldText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['400'],
 marginBottom: props.theme.spacing(3)
}));

const SubText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));

interface Props {
  titleText?: string;
  bodyText: string;
}

function InfoContainer({ titleText, bodyText }: Props) {
  return (
    <Container>
      <img src={InfoIcon} alt="alert" />
      <TextContainer>
        {titleText ?? <BoldText>{titleText}</BoldText>}
        <SubText>{bodyText}</SubText>
      </TextContainer>
    </Container>
  );
}

export default InfoContainer;
