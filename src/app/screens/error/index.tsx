import React from 'react';
import { useRouteError } from 'react-router-dom';
import Error from '@assets/img/ErrorBoundary/error.svg';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SUPPORT_EMAIL } from '@utils/constants';

const ScreenContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  height: '100vh',
  width: '100vw',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: props.theme.colors.background['elevation-1'],
  paddingTop: props.theme.spacing(80),
  paddingLeft: props.theme.spacing(9),
  paddingRight: props.theme.spacing(9),
}));

const ScreenTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(10),
}));

const ErrorContent = styled.p((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
  color: props.theme.colors.white[200],
}));

const SupportText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(5),
  textAlign: 'center',
  color: props.theme.colors.white[200],
  span: {
    color: props.theme.colors.white[0],
  },
}));

function ErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation('translation', { keyPrefix: 'ERROR_SCREEN' });
  return (
    <ScreenContainer>
      <img src={Error} alt="Error" width={88} />
      <ScreenTitle>{t('TITLE')}</ScreenTitle>
      <ErrorContent>
        {`${t('ERROR_PREFIX')}${' '}${error.message}${' '}${t(
          'ERROR_ACTION',
        )}`}
      </ErrorContent>
      <SupportText>
        {t('SUPPORT')}
        {' '}
        <span>{SUPPORT_EMAIL}</span>
      </SupportText>
    </ScreenContainer>
  );
}

export default ErrorBoundary;
