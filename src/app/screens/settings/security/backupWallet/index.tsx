import PasswordInput from '@components/passwordInput';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import SeedCheck from '@screens/backupWalletSteps/seedCheck';
import { Container } from '@screens/settings/index.styles';
import { setWalletBackupStatusAction } from '@stores/wallet/actions/actionCreators';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const EnterPasswordContainer = styled.div((props) => ({
  width: '100%',
  height: '100%',
  zIndex: 10,
  background: props.theme.colors.elevation0,
  backdropFilter: 'blur(16px)',
  paddingTop: props.theme.space.l,
}));

const SeedphraseContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(5),
}));

function BackupWalletScreen() {
  const { t } = useTranslation('translation');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
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

  const handleBackButtonClick = () => {
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
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        {!showSeed && (
          <EnterPasswordContainer>
            <PasswordInput
              title={t('SETTING_SCREEN.BACKUP_WALLET_UNLOCK_SEED')}
              inputLabel={t('SETTING_SCREEN.PASSWORD')}
              enteredPassword={password}
              setEnteredPassword={setPassword}
              handleContinue={handlePasswordNextClick}
              handleBack={handleBackButtonClick}
              passwordError={error}
              stackButtonAlignment
              loading={loading}
              autoFocus
            />
          </EnterPasswordContainer>
        )}
        <SeedphraseContainer>
          {showSeed && <SeedCheck seedPhrase={seed} onContinue={handleBackButtonClick} />}
        </SeedphraseContainer>
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default BackupWalletScreen;
