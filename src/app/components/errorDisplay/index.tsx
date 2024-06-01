import Error from '@assets/img/ErrorBoundary/error.svg';
import { SUPPORT_EMAIL } from '@utils/constants';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ScreenContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  height: '100vh',
  width: '100vw',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: props.theme.colors.elevation_n1,
  paddingTop: props.theme.spacing(80),
  paddingLeft: props.theme.spacing(9),
  paddingRight: props.theme.spacing(9),
}));

const ScreenTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(10),
}));

const ErrorDescription = styled.p((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
  color: props.theme.colors.white_200,
}));

const SupportText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(5),
  textAlign: 'center',
  color: props.theme.colors.white_200,
  span: {
    color: props.theme.colors.white_0,
  },
}));

const ErrorContent = styled.p((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(20),
  textAlign: 'center',
  color: props.theme.colors.white_200,
}));

type Props = {
  error: { message: string };
};

function ErrorDisplay({ error }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'ERROR_SCREEN' });
  return (
    <ScreenContainer>
      <img src={Error} alt="Error" width={88} />
      <ScreenTitle>{t('TITLE')}</ScreenTitle>
      <ErrorDescription>{t('ERROR_DESCRIPTION')}</ErrorDescription>
      <SupportText>
        {t('SUPPORT')} <span>{SUPPORT_EMAIL}</span>
      </SupportText>
      <ErrorContent>{`${t('ERROR_PREFIX')}${' '}${error.message}`}</ErrorContent>
    </ScreenContainer>
  );
}

export default ErrorDisplay;
