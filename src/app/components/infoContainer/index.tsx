import styled from 'styled-components';
import InfoIcon from '@assets/img/info.svg';
import WarningIcon from '@assets/img/Warning.svg';

interface ContainerProps {
  type: 'Info' | 'Warning' | undefined;
  showWarningBackground?: boolean;
}
const Container = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  borderRadius: 12,
  alignItems: 'flex-start',
  backgroundColor: props.showWarningBackground ? 'rgba(211, 60, 60, 0.15)' : 'transparent',
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

const RedirectText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
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

const RedirectButton = styled.button((props) => ({
  backgroundColor: 'transparent',
  color: props.theme.colors.white['0'],
  display: 'flex',
  marginTop: 4,
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}));

interface Props {
  titleText?: string;
  bodyText: string;
  type?: 'Info' | 'Warning';
  onClick?: () => void;
  redirectText?: string;
  showWarningBackground?: boolean;
}

function InfoContainer({
  titleText,
  bodyText,
  type,
  redirectText,
  onClick,
  showWarningBackground,
}: Props) {
  return (
    <Container type={type} showWarningBackground={showWarningBackground}>
      <img src={type === 'Warning' ? WarningIcon : InfoIcon} alt="alert" />
      <TextContainer>
        {titleText ? (
          <>
            <BoldText>{titleText}</BoldText>
            <SubText>{bodyText}</SubText>
          </>
        ) : (
          <>
            <Text>{bodyText}</Text>
            {redirectText && (
              <RedirectButton onClick={onClick}>
                <RedirectText>{`${redirectText} →`}</RedirectText>
              </RedirectButton>
            )}
          </>
        )}
      </TextContainer>
    </Container>
  );
}

export default InfoContainer;
