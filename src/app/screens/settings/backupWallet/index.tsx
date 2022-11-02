import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '@components/passwordInput';
import TopRow from '@components/topRow';
import BottomBar from '@components/tabBar';
import useWalletReducer from '@hooks/useWalletReducer';
import SeedCheck from '@screens/backupWalletSteps/seedCheck';
import useWalletSelector from '@hooks/useWalletSelector';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-left: 16px;
  padding-right: 16px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

function BackupWalletScreen() {
  const { t } = useTranslation('translation');
  const { seedPhrase } = useWalletSelector();
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSeed, setShowSeed] = useState<boolean>(false);
  const navigate = useNavigate();
  const { unlockWallet } = useWalletReducer();

  const goToSettingScreen = () => {
    navigate('/settings');
  };

  const handlePasswordNextClick = async () => {
    try {
      await unlockWallet(password);
      setPassword('');
      setError('');
      setShowSeed(true);
    } catch (e) {
      setError(t('CREATE_PASSWORD_SCREEN.INCORRECT_PASSWORD_ERROR'));
    }
  };

  const enterPassword = (
    <PasswordInput
      title={t('SETTING_SCREEN.BACKUP_WALLET_UNLOCK_SEED')}
      inputLabel={t('SETTING_SCREEN.PASSWORD')}
      enteredPassword={password}
      setEnteredPassword={setPassword}
      handleContinue={handlePasswordNextClick}
      handleBack={goToSettingScreen}
      passwordError={error}
      stackButtonAlignment
    />
  );

  const seedPhraseView = (
    <SeedCheck seedPhrase={seedPhrase} onContinue={goToSettingScreen} />
  );

  return (
    <>
      <TopRow title={t('SETTING_SCREEN.BACKUP_WALLET')} onClick={goToSettingScreen} />
      <Container>
        {!showSeed && enterPassword}
        {showSeed && seedPhraseView}
      </Container>
      <BottomBar tab="settings" />
    </>

  );
}

export default BackupWalletScreen;
