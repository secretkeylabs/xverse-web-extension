import xverseLogoIcon from '@assets/img/full_logo_horizontal.svg';
import {
  ActionButtons,
  ErrorCode,
  ErrorContents,
  ErrorDescription,
  ErrorDetailsSection,
  ErrorDetailTitle,
  ErrorStackContainer,
  ErrorSubtitle,
  ErrorTitle,
  FooterContainer,
  FullScreenHeader,
  IconContainer,
  InfoWarning,
  RouteContainer,
  ScreenContainer,
  StackDetails,
  StackToggle,
  SupportEmail,
  TestnetContainer,
  TestnetText,
  XverseLogo,
} from '@components/errorDisplay/index.styled';
import useWalletSelector from '@hooks/useWalletSelector';
import { CaretDown, CaretUp, Copy, WarningOctagon } from '@phosphor-icons/react';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import { SUPPORT_EMAIL } from '@utils/constants';
import { isInOptions } from '@utils/helper';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Theme from '../../../theme';

declare const VERSION: string;

interface RouteError {
  status: number;
  statusText: string;
  description?: string;
  stack?: string;
}

type Props = {
  error: RouteError;
};

function ErrorDisplay({ error }: Props) {
  const { network } = useWalletSelector();
  const { t } = useTranslation('translation');
  const { t: errorT } = useTranslation('translation', { keyPrefix: 'ERROR_SCREEN' });
  const isInOption = isInOptions();
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const [showStack, setShowStack] = useState(false);
  const CaretIcon = showStack ? CaretUp : CaretDown;

  const {
    status = 404,
    statusText = 'Not Found',
    description = 'An unexpected error occurred',
    stack,
  } = error;

  const handleCopyError = () => {
    const errorReport = `
    Error Details
    Error: ${errorT('ERROR_CODE_MESSAGE', { code: status, message: statusText })}
    Timestamp: ${new Date().toISOString()}
    App Version: ${VERSION} (Beta)
    Description: ${description}
    ${stack ? `Stack Trace: ${stack}` : ''}
    `.trim();
    navigator.clipboard.writeText(errorReport);
    toast(errorT('ERROR_REPORT_COPIED'));
  };

  return (
    <ScreenContainer>
      {isInOption && (
        <FullScreenHeader>
          <XverseLogo src={xverseLogoIcon} />
        </FullScreenHeader>
      )}
      <RouteContainer>
        {network.type === 'Testnet' && (
          <TestnetContainer>
            <TestnetText>{t('SETTING_SCREEN.TESTNET')}</TestnetText>
          </TestnetContainer>
        )}
        {network.type === 'Testnet4' && (
          <TestnetContainer>
            <TestnetText>{t('SETTING_SCREEN.TESTNET4')}</TestnetText>
          </TestnetContainer>
        )}
        {network.type === 'Signet' && (
          <TestnetContainer>
            <TestnetText>{t('SETTING_SCREEN.SIGNET')}</TestnetText>
          </TestnetContainer>
        )}
        {network.type === 'Regtest' && (
          <TestnetContainer>
            <TestnetText>{t('SETTING_SCREEN.REGTEST')}</TestnetText>
          </TestnetContainer>
        )}
        <ErrorContents>
          <ErrorTitle>:(</ErrorTitle>
          <ErrorSubtitle>{errorT('ERROR_TITLE')}</ErrorSubtitle>
          <ErrorDescription>
            {errorT('ERROR_CODE_MESSAGE', { code: status, message: statusText })}
          </ErrorDescription>
          {description && <ErrorDescription>Error description: {description}</ErrorDescription>}
          <ErrorDescription>
            {errorT('CONTACT_SUPPORT')}{' '}
            <SupportEmail href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</SupportEmail>
          </ErrorDescription>
          {stack && (
            <ErrorStackContainer>
              <StackToggle onClick={() => setShowStack(!showStack)}>
                See details
                <IconContainer>
                  <CaretIcon size={14} weight="bold" color={Theme.colors.tangerine_light} />
                </IconContainer>
              </StackToggle>
              {showStack && (
                <StackDetails>
                  <InfoWarning>
                    <IconContainer>
                      <WarningOctagon weight="fill" color={Theme.colors.white_200} size={24} />
                    </IconContainer>
                    <div>{errorT('SHARING_WARNING')}</div>
                  </InfoWarning>
                  <ErrorDetailsSection>
                    <ErrorDetailTitle>Error Details</ErrorDetailTitle>
                    <div>Error Code: {status}</div>
                    <div>Timestamp: {new Date().toISOString()}</div>
                    <div>{`App Version: ${VERSION} (Beta)`}</div>
                  </ErrorDetailsSection>
                  <ErrorDetailsSection>
                    <ErrorDetailTitle>Description</ErrorDetailTitle>
                    <div>{description}</div>
                  </ErrorDetailsSection>
                  {stack && (
                    <ErrorCode>
                      <pre>{stack}</pre>
                    </ErrorCode>
                  )}
                </StackDetails>
              )}
            </ErrorStackContainer>
          )}
          <ActionButtons>
            <Button
              icon={<Copy color={Theme.colors.white_0} weight="bold" size={16} />}
              title={errorT('COPY_ERROR_REPORT')}
              onClick={handleCopyError}
              variant="secondary"
            />
            <Button
              title={errorT('RESTART_XVERSE')}
              onClick={() => navigate('/')}
              variant="primary"
            />
          </ActionButtons>
        </ErrorContents>
      </RouteContainer>
      {isInOption && (
        <FooterContainer>
          <StyledP typography="body_medium_m" color="white_400">
            {t('SEND.COPYRIGHT', { year })}
          </StyledP>
        </FooterContainer>
      )}
    </ScreenContainer>
  );
}

export default ErrorDisplay;
