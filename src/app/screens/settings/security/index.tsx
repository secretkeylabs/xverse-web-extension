import ResetWalletPrompt from '@components/resetWallet';
import TopRow from '@components/topRow';
import RoutePaths from 'app/routes/paths';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Title } from '../index.styles';
import SettingComponent from '../settingComponent';

function Security() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const navigate = useNavigate();
  const [showResetWalletPrompt, setShowResetWalletPrompt] = useState(false);

  const openResetWalletScreen = () => {
    setShowResetWalletPrompt(false);
    navigate(RoutePaths.ResetWallet);
  };

  const openResetWalletPrompt = () => {
    setShowResetWalletPrompt(true);
  };

  const onResetWalletPromptClose = () => {
    setShowResetWalletPrompt(false);
  };

  const openUpdatePasswordScreen = () => {
    navigate(RoutePaths.ChangePassword);
  };

  const openBackUpWalletScreen = () => {
    navigate(RoutePaths.BackupWallet);
  };

  const handleBackButtonClick = () => {
    navigate(RoutePaths.Settings);
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('CATEGORIES.SECURITY')}</Title>
        <SettingComponent
          text={t('UPDATE_PASSWORD')}
          onClick={openUpdatePasswordScreen}
          showDivider
        />
        <SettingComponent text={t('BACKUP_WALLET')} onClick={openBackUpWalletScreen} showDivider />
        <SettingComponent
          text={t('RESET_WALLET')}
          onClick={openResetWalletPrompt}
          showWarningTitle
          showArrow={false}
        />
        <ResetWalletPrompt
          showResetWalletPrompt={showResetWalletPrompt}
          onResetWalletPromptClose={onResetWalletPromptClose}
          openResetWalletScreen={openResetWalletScreen}
        />
      </Container>
    </>
  );
}

export default Security;
