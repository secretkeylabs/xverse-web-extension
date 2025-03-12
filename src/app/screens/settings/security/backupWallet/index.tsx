import PasswordInput from '@components/passwordInput';
import SeedBackup from '@components/seedBackup';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useAsyncFn from '@hooks/useAsyncFn';
import useVault from '@hooks/useVault';
import { Spinner } from '@phosphor-icons/react';
import { Container } from '@screens/settings/index.styles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const SeedPhraseContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(5),
}));

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.l,
}));

function BackupWalletScreen() {
  const { t } = useTranslation('translation');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const navigate = useNavigate();
  const vault = useVault();

  const { isLoading } = useAsyncFn(
    async ({ signal }) => {
      if (!showSeed && !signal.aborted) {
        setMnemonic('');
        return;
      }
      // TODO multiwallet: Allow user to select which wallet to view the seed phrase for and pass to SeedBackup below
      const primaryWalletId = await vault.SeedVault.getPrimaryWalletId();

      if (!primaryWalletId) {
        throw new Error('No primary wallet found');
      }

      const walletSecrets = await vault.SeedVault.getWalletSecrets(primaryWalletId);

      if (!walletSecrets.mnemonic) {
        throw new Error('No mnemonic found');
      }

      if (!signal.aborted) {
        setMnemonic(walletSecrets.mnemonic);
      }
    },
    [showSeed, vault],
  );

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handlePasswordNextClick = async () => {
    try {
      setLoading(true);
      await vault.unlockVault(password);
      setPassword('');
      setError('');
      setShowSeed(true);
    } catch (e) {
      setError(t('CREATE_PASSWORD_SCREEN.INCORRECT_PASSWORD_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LoaderContainer>
        <Spinner color="white" size={50} />
      </LoaderContainer>
    );
  }

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
        <SeedPhraseContainer>{showSeed && <SeedBackup mnemonic={mnemonic} />}</SeedPhraseContainer>
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default BackupWalletScreen;
