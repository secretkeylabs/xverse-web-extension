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
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  paddingTop: props.theme.spacing(60),
}));

const Image = styled.img({
  alignSelf: 'center',
  width: 88,
  height: 88,
});

const HeadingText = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  marginTop: props.theme.spacing(8),
}));

const BodyText = styled.h1((props) => ({
  ...props.theme.typography.body_l,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
  marginBottom: props.theme.spacing(42),
}));

const CloseButton = styled(Button)((props) => ({
  marginBottom: props.theme.spacing(42),
}));

interface RequestErrorProps {
  errorTitle?: string;
  error: string;
  onClose?: () => void;
}

function RequestError({ error, errorTitle, onClose }: RequestErrorProps) {
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
      <Image src={Failure} />
      <HeadingText>{errorTitle || t('INVALID_REQUEST')}</HeadingText>
      <BodyText>{error}</BodyText>
      <CloseButton onClick={handleClose} title="Close" variant="secondary" />
    </Container>
  );
}

export default RequestError;
