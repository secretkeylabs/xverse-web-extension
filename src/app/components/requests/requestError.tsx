import Failure from '@assets/img/send/x_circle.svg';
import Button from '@ui-library/button';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
/**
 * A component that displays an error message when a request fails. due to an error in the request payload
 */

const Container = styled.div((props) => ({
  background: props.theme.colors.elevation0,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  marginLeft: props.theme.space.m,
  marginRight: props.theme.space.m,
}));

const Image = styled.img({
  alignSelf: 'center',
  width: 88,
  height: 88,
});

const HeadingText = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  marginTop: props.theme.space.m,
}));

const BodyText = styled.h1<{ $textAlignment: 'center' | 'left' }>((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.m,
  textAlign: props.$textAlignment,
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
  whiteSpace: 'pre-line',
}));

const OuterContainer = styled.div((_props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  flex: 1,
}));

const BodyContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.space.xl,
  marginBottom: props.theme.space.xl,
}));

interface RequestErrorProps {
  errorTitle?: string;
  error: string;
  textAlignment?: 'center' | 'left';
  onClose?: () => void;
}

function RequestError({ error, errorTitle, onClose, textAlignment = 'center' }: RequestErrorProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'REQUEST_ERRORS' });

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.close();
    }
  };

  return (
    <Container>
      <OuterContainer>
        <BodyContainer>
          <Image src={Failure} />
          <HeadingText>{errorTitle || t('INVALID_REQUEST')}</HeadingText>
          <BodyText $textAlignment={textAlignment}>{error}</BodyText>
        </BodyContainer>
      </OuterContainer>
      <ButtonContainer>
        <Button onClick={handleClose} title="Close" variant="primary" />
      </ButtonContainer>
    </Container>
  );
}

export default RequestError;
