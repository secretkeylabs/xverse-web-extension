import backup from '@assets/img/backupWallet/backup.svg';
import ActionButton from '@components/button';
import useSeedVault from '@hooks/useSeedVault';
import { generateMnemonic } from '@secretkeylabs/xverse-core/wallet';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  flex: 1,
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
}));

const IconContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const ContentContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginBottom: props.theme.spacing(32),
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

const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(8),
  width: '100%',
}));

function BackupWallet(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });
  const navigate = useNavigate();
  const { init: initSeedVault, storeSeed } = useSeedVault();

  useEffect(() => {
    (async () => {
      await initSeedVault('');
      const newSeedPhrase = generateMnemonic();
      await storeSeed(newSeedPhrase, true);
    })();
  }, []);

  const handleBackup = () => {
    navigate('/backupWalletSteps', { replace: true });
  };

  const handleSkip = () => {
    navigate('/create-password', { replace: true });
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
          <TransparentButtonContainer>
            <ActionButton onPress={handleSkip} transparent text={t('BACKUP_SKIP_BUTTON')} />
          </TransparentButtonContainer>
          <ActionButton onPress={handleBackup} text={t('BACKUP_BUTTON')} />
        </BackupActionsContainer>
      </ContentContainer>
    </Container>
  );
}

export default BackupWallet;
