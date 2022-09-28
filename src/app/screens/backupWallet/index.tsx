import backup from '@assets/img/backupWallet/backup.svg';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Container = styled.div((props) => ({
  flex: 1,
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
}));

const IconContainer = styled.div((props) => ({
  display: 'flex',
  flex: 0.6,
  justifyContent: 'center',
  alignItems: 'center',
}));

const ContentContainer = styled.div((props) => ({
  display: 'flex',
  flex: 0.4,
  flexDirection: 'column',
  justifyContent: 'center',
}));

const Title = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
}));

const SubTitle = styled.h2((props) => ({
  ...props.theme.body_l,
  textAlign: 'center',
  marginTop: props.theme.spacing(4),
  color: props.theme.colors.white['200'],
}));

const BackupActionsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(20),
  width: '100%',
}));

const BackupButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  color: props.theme.colors.white['0'],
  width: '48%',
  height: 44,
}));

const SkipBackupButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.background.elevation0,
  border: '1px solid #272A44',
  color: props.theme.colors.white['0'],
  width: '48%',
  height: 44,
}));

function BackupWallet(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });
  const navigate = useNavigate();

  const handleBackup = () => {
    navigate('/');
  };

  const handleSkip = () => {
    navigate('/create-password');
  };

  return (
    <Container>
      <IconContainer>
        <img src={backup} alt="backup" width={208} />
      </IconContainer>
      <ContentContainer>
        <Title>{t('SCREEN_TITLE')}</Title>
        <SubTitle>{t('SCREEN_SUBTITLE')}</SubTitle>
        <BackupActionsContainer>
          <SkipBackupButton onClick={handleSkip}>
            {t('BACKUP_SKIP_BUTTON')}
          </SkipBackupButton>
          <BackupButton onClick={handleBackup}>
            {t('BACKUP_BUTTON')}
          </BackupButton>
        </BackupActionsContainer>
      </ContentContainer>
    </Container>
  );
}

export default BackupWallet;
