import backup from '@assets/img/backupWallet/backup.svg';
import ActionButton from '@components/button';
import useSeedVault from '@hooks/useSeedVault';
import { generateMnemonic } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
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
  ...props.theme.typography.body_bold_l,
  textAlign: 'center',
}));

const SubTitle = styled.h2((props) => ({
  ...props.theme.typography.body_l,
  textAlign: 'center',
  marginTop: props.theme.space.xs,
  color: props.theme.colors.white_200,
}));

const BackupActionsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(20),
  width: '100%',
  columnGap: props.theme.space.xs,
}));

function BackupWallet(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });
  const navigate = useNavigate();
  const {
    init: initSeedVault,
    storeSeed,
    unlockVault,
    hasSeed,
    clearVaultStorage,
  } = useSeedVault();

  const generateAndStoreSeedPhrase = async () => {
    const newSeedPhrase = generateMnemonic();
    await initSeedVault('');
    await storeSeed(newSeedPhrase);
  };

  useEffect(() => {
    (async () => {
      const hasSeedPhrase = await hasSeed();
      if (!hasSeedPhrase) {
        await generateAndStoreSeedPhrase();
      } else {
        // attempt to unlock the wallet with an empty password (verifies the user didn't finish onboarding)
        await unlockVault('');
        // clear the vault storage and generate a new seed phrase
        await clearVaultStorage();
        await generateAndStoreSeedPhrase();
      }
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
          <Button onClick={handleSkip} variant="secondary" title={t('BACKUP_SKIP_BUTTON')} />
          <Button onClick={handleBackup} title={t('BACKUP_BUTTON')} />
        </BackupActionsContainer>
      </ContentContainer>
    </Container>
  );
}

export default BackupWallet;
