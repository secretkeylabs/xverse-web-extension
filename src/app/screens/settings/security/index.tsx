import PasswordInput from '@components/passwordInput';
import ResetWalletPrompt from '@components/resetWallet';
import useSeedVault from '@hooks/useSeedVault';
import useWalletReducer from '@hooks/useWalletReducer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SettingComponent from '../settingComponent';

const ResetWalletContainer = styled.div((props) => ({
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  zIndex: 10,
  background: 'rgba(25, 25, 48, 0.5)',
  backdropFilter: 'blur(10px)',
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  paddingTop: props.theme.spacing(50),
}));

function Security() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const navigate = useNavigate();
  const { resetWallet } = useWalletReducer();
  const { unlockVault } = useSeedVault();
  const [showResetWalletPrompt, setShowResetWalletPrompt] = useState(false);
  const [showResetWalletDisplay, setShowResetWalletDisplay] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openResetWalletScreen = () => {
    setShowResetWalletPrompt(false);
    setShowResetWalletDisplay(true);
  };

  const openResetWalletPrompt = () => {
    setShowResetWalletPrompt(true);
  };

  const onResetWalletPromptClose = () => {
    setShowResetWalletPrompt(false);
  };

  const goToSettingScreen = () => {
    setShowResetWalletDisplay(false);
  };

  const handlePasswordNextClick = async () => {
    try {
      setLoading(true);
      await unlockVault(password);
      setPassword('');
      setError('');
      await resetWallet();
    } catch (e) {
      setError(t('INCORRECT_PASSWORD_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  const openUpdatePasswordScreen = () => {
    navigate('/change-password');
  };

  const openBackUpWalletScreen = () => {
    navigate('/backup-wallet');
  };

  return (
    <div>
      {showResetWalletDisplay && (
        <ResetWalletContainer>
          <PasswordInput
            title={t('ENTER_PASSWORD')}
            inputLabel={t('PASSWORD')}
            enteredPassword={password}
            setEnteredPassword={setPassword}
            handleContinue={handlePasswordNextClick}
            handleBack={goToSettingScreen}
            passwordError={error}
            stackButtonAlignment
            loading={loading}
          />
        </ResetWalletContainer>
      )}
      <h1>Security</h1>
      <SettingComponent
        text={t('BACKUP_WALLET')}
        onClick={openBackUpWalletScreen}
        // icon={ArrowIcon}
        showDivider
      />
      <SettingComponent
        title={t('SECURITY')}
        text={t('UPDATE_PASSWORD')}
        onClick={openUpdatePasswordScreen}
        // icon={ArrowIcon}
        showDivider
      />
      <SettingComponent text={t('RESET_WALLET')} onClick={openResetWalletPrompt} showWarningTitle />
      <ResetWalletPrompt
        showResetWalletPrompt={showResetWalletPrompt}
        onResetWalletPromptClose={onResetWalletPromptClose}
        openResetWalletScreen={openResetWalletScreen}
      />
    </div>
  );
}

export default Security;
