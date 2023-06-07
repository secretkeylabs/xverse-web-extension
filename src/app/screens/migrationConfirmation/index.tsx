import { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ActionButton from '@components/button';
import migrateCachedStorage from '@utils/migrate';
import WarningIcon from '@assets/img/Warning.svg';
import WarningStatus from '@assets/img/warningIcon.svg';
import CheckCircle from '@assets/img/createWalletSuccess/CheckCircle.svg';

const Container = styled.div`
  display: flex;
  margin-left: auto;
  margin-right: auto;
  flex-direction: column;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
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
  justifyContent: 'center',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const OnboardingTitle = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
}));

const SkipButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const Icon = styled.img((props) => ({
  width: 88,
  height: 88,
  alignSelf: 'center',
  marginTop: 'auto',
  marginBottom: props.theme.spacing(8),
}));

function MigrationConfirmation(): JSX.Element {
  const [hasFinishedMigrating, setHasFinishedMigrating] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CACHE_MIGRATION_SCREEN' });
  const handleConfirm = async () => {
    await migrateCachedStorage();
    setHasFinishedMigrating(true);
  };

  const onCloseTab = () => {
    window.close();
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <Container>
      <OnBoardingContentContainer>
        <Icon src={!hasFinishedMigrating ? WarningStatus : CheckCircle} />
        {!hasFinishedMigrating ? (
          <OnboardingTitle>{t('TITLE')}</OnboardingTitle>
        ) : (
          <OnboardingTitle>{t('SUCCESS_TITLE')}</OnboardingTitle>
        )}

        {!hasFinishedMigrating ? (
          <ButtonsContainer>
            <SkipButtonContainer>
              <ActionButton
                text={t('SKIP_BUTTON')}
                onPress={handleSkip}
                warning
                src={WarningIcon}
              />
            </SkipButtonContainer>
            <ActionButton onPress={handleConfirm} text={t('CONFIRM_BUTTON')} />
          </ButtonsContainer>
        ) : (
          <ButtonsContainer>
            <ActionButton text={t('CLOSE_TAB')} onPress={onCloseTab} />
          </ButtonsContainer>
        )}
      </OnBoardingContentContainer>
    </Container>
  );
}

export default MigrationConfirmation;
