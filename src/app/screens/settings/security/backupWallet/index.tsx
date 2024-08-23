import PasswordInput from '@components/passwordInput';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useSeedVault from '@hooks/useSeedVault';
import SeedCheck from '@screens/backupWalletSteps/seedCheck';
import { Container, Title } from '@screens/settings/index.styles';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const EnterPasswordContainer = styled.div((props) => ({
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  zIndex: 10,
  background: props.theme.colors.elevation0,
  backdropFilter: 'blur(16px)',
  padding: 16,
  paddingTop: props.theme.spacing(40),
}));

const SeedphraseContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(5),
}));

function BackupWalletScreen() {
  const { t } = useTranslation('translation');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSeed, setShowSeed] = useState<boolean>(false);
  const [seed, setSeed] = useState('');
  const navigate = useNavigate();
  const { getSeed, unlockVault } = useSeedVault();

  useEffect(() => {
    (async () => {
      const seedPhrase = await getSeed();
      setSeed(seedPhrase);
    })();

    return () => {
      setSeed('');
    };
  }, []);

  const goBack = () => {
    navigate(-1);
  };

  const handlePasswordNextClick = async () => {
    try {
      setLoading(true);
      await unlockVault(password);
      setPassword('');
      setError('');
      setShowSeed(true);
    } catch (e) {
      setError(t('CREATE_PASSWORD_SCREEN.INCORRECT_PASSWORD_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopRow onClick={goBack} />
      <Container>
        <Title>{t('SETTING_SCREEN.BACKUP_WALLET')}</Title>
        {!showSeed && (
          <EnterPasswordContainer>
            <PasswordInput
              title={t('SETTING_SCREEN.BACKUP_WALLET_UNLOCK_SEED')}
              inputLabel={t('SETTING_SCREEN.PASSWORD')}
              enteredPassword={password}
              setEnteredPassword={setPassword}
              handleContinue={handlePasswordNextClick}
              handleBack={goBack}
              passwordError={error}
              stackButtonAlignment
              loading={loading}
            />
          </EnterPasswordContainer>
        )}
        <SeedphraseContainer>
          {showSeed && <SeedCheck seedPhrase={seed} onContinue={goBack} />}
        </SeedphraseContainer>
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default BackupWalletScreen;
