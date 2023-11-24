import WarningStatus from '@assets/img/warningIcon.svg';
import ActionButton from '@components/button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  margin-left: auto;
  margin-right: auto;
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
  justifyContent: 'center',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const OnboardingTitle = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
}));

const OnboardingContent = styled.div((props) => ({
  ...props.theme.body_l,
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

interface Props {
  migrateCallback: () => Promise<void>;
}

function MigrationConfirmation(props: Props): JSX.Element {
  const { migrateCallback } = props;
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('translation', { keyPrefix: 'CACHE_MIGRATION_SCREEN' });

  const handleConfirm = async () => {
    setIsLoading(true);
    await migrateCallback();
    setIsLoading(false);
  };

  return (
    <Container>
      <OnBoardingContentContainer>
        <Icon src={WarningStatus} />
        <OnboardingTitle>{t('TITLE')}</OnboardingTitle>
        <OnboardingContent>{t('WARNING')}</OnboardingContent>
        <ButtonsContainer>
          <ActionButton text={t('CLOSE_TAB')} onPress={handleConfirm} processing={isLoading} />
        </ButtonsContainer>
      </OnBoardingContentContainer>
    </Container>
  );
}

export default MigrationConfirmation;
