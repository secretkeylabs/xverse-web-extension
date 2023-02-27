import styled from 'styled-components';
import InfoIcon from '@assets/img/info.svg';
import WarningIcon from '@assets/img/Warning.svg';

const Container = styled.div<{ type: 'Info' | 'Warning' | undefined }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  borderRadius: 12,
  alignItems: 'flex-start',
  backgroundColor: 'transparent',
  padding: props.theme.spacing(8),
  marginBottom: props.theme.spacing(6),
  border: `1px solid ${
    props.type === 'Warning' ? props.theme.colors.feedback.error_700 : 'rgba(255, 255, 255, 0.2)'
  }`,
}));

const TextContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
}));

const BoldText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
}));

const SubText = styled.h1((props) => ({
  ...props.theme.body_xs,
  marginTop: props.theme.spacing(2),
  color: props.theme.colors.white['200'],
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
  lineHeight: 1.4,
}));

interface Props {
  titleText?: string;
  bodyText: string;
  type?: 'Info' | 'Warning';
}

function InfoContainer({ titleText, bodyText, type }: Props) {
  return (
    <Container type={type}>
      <img src={type === 'Warning' ? WarningIcon : InfoIcon} alt="alert" />
      <TextContainer>
        {titleText ? (
          <>
            <BoldText>{titleText}</BoldText>
            <SubText>{bodyText}</SubText>
          </>
        ) : (
          <Text>{bodyText}</Text>
        )}
      </TextContainer>
    </Container>
  );
}

export default InfoContainer;
