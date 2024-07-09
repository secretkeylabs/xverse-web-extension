import CheckCircle from '@assets/img/createWalletSuccess/CheckCircle.svg';
import WarningStatus from '@assets/img/warningIcon.svg';
import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { trackMixPanel } from '@utils/mixpanel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 'auto',
  marginBottom: props.theme.spacing(20),
}));

const OnBoardingContentContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const OnboardingTitle = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  textAlign: 'center',
}));

const OnboardingContent = styled.div((props) => ({
  ...props.theme.typography.body_l,
  marginTop: 10,
  textAlign: 'center',
}));

const Icon = styled.img((props) => ({
  width: 88,
  height: 88,
  alignSelf: 'center',
  marginTop: 'auto',
  marginBottom: props.theme.spacing(8),
}));

const SkipButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

interface Props {
  migrateCallback: () => Promise<void>;
}

function MigrationConfirmation(props: Props): JSX.Element {
  const { migrateCallback } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [hasFinishedMigrating, setHasFinishedMigrating] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CACHE_MIGRATION_SCREEN' });

  const handleConfirm = async () => {
    setIsLoading(true);
    await migrateCallback();
    setHasFinishedMigrating(true);
    setIsLoading(false);
  };

  const handleSkip = async () => {
    trackMixPanel(AnalyticsEvents.WalletSkippedMigration);
    navigate('/');
  };

  return (
    <Container>
      <OnBoardingContentContainer>
        <Icon src={!hasFinishedMigrating ? WarningStatus : CheckCircle} />
        {!hasFinishedMigrating ? (
          <>
            <OnboardingTitle>{t('TITLE')}</OnboardingTitle>
            <OnboardingContent>{t('WARNING1')}</OnboardingContent>
            <OnboardingContent>{t('WARNING2')}</OnboardingContent>
          </>
        ) : (
          <OnboardingTitle>{t('SUCCESS_TITLE')}</OnboardingTitle>
        )}
        {!hasFinishedMigrating ? (
          <ButtonsContainer>
            <SkipButtonContainer>
              <Button title={t('SKIP_BUTTON')} onClick={handleSkip} variant="secondary" />
            </SkipButtonContainer>
            <Button onClick={handleConfirm} title={t('CONFIRM_BUTTON')} loading={isLoading} />
          </ButtonsContainer>
        ) : (
          <ButtonsContainer>
            <Button title={t('CLOSE_TAB')} onClick={handleSkip} />
          </ButtonsContainer>
        )}
      </OnBoardingContentContainer>
    </Container>
  );
}

export default MigrationConfirmation;
