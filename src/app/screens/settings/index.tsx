import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useWalletSelector from '@hooks/useWalletSelector';
import XverseLogo from '@assets/img/settings/logo.svg';
import ArrowIcon from '@assets/img/settings/arrow.svg';
import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import BottomBar from '@components/tabBar';
import { PRIVACY_POLICY_LINK, TERMS_LINK, SUPPORT_LINK } from '@utils/constants';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PasswordInput from '@components/passwordInput';
import useWalletReducer from '@hooks/useWalletReducer';
import SettingComponent from './settingComponent';
import ResetWalletPrompt from './resetWallet';

declare const VERSION: string;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ResetWalletContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  zIndex: 10,
  background: 'rgba(25, 25, 48, 0.5)',
  backdropFilter: 'blur(16px)',
  paddingTop: props.theme.spacing(50),
  paddingBottom: props.theme.spacing(20),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),

}));

const LogoContainer = styled.div((props) => ({
  padding: props.theme.spacing(11),
  borderBottom: `1px solid ${props.theme.colors.background.elevation3}`,
}));

function Setting() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const [showResetWalletPrompt, setShowResetWalletPrompt] = useState<boolean>(false);
  const [showResetWalletDisplay, setShowResetWalletDisplay] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { fiatCurrency, network } = useWalletSelector();
  const navigate = useNavigate();
  const { unlockWallet, resetWallet } = useWalletReducer();

  const openTermsOfService = () => {
    window.open(TERMS_LINK);
  };

  const openPrivacyPolicy = () => {
    window.open(PRIVACY_POLICY_LINK);
  };

  const openSupport = () => {
    window.open(SUPPORT_LINK);
  };

  const openFiatCurrencyScreen = () => {
    navigate('/fiat-currency');
  };

  const openChangeNetworkScreen = () => {
    navigate('/change-network');
  };

  const openBackUpWalletScreen = () => {
    navigate('/backup-wallet');
  };

  const openUpdatePasswordScreen = () => {
    navigate('/change-password');
  };

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

  const handleResetWallet = () => {
    resetWallet();
    navigate('/');
  };

  const handlePasswordNextClick = async () => {
    try {
      await unlockWallet(password);
      setPassword('');
      setError('');
      handleResetWallet();
    } catch (e) {
      setError(t('INCORRECT_PASSWORD_ERROR'));
    }
  };

  return (
    <>
      { showResetWalletDisplay && (
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
        />
      </ResetWalletContainer>
      )}
      <LogoContainer>
        <img src={XverseLogo} alt="xverse logo" />
      </LogoContainer>
      <Container>
        <SettingComponent
          title={t('GENERAL')}
          text={t('CURRENCY')}
          onClick={openFiatCurrencyScreen}
          textDetail={fiatCurrency}
          showDivider
        />
        <SettingComponent
          text={t('NETWORK')}
          onClick={openChangeNetworkScreen}
          textDetail={network.type}
        />
        <SettingComponent
          title={t('SECURITY')}
          text={t('UPDATE_PASSWORD')}
          onClick={openUpdatePasswordScreen}
          icon={ArrowIcon}
          showDivider
        />
        <SettingComponent
          text={t('BACKUP_WALLET')}
          onClick={openBackUpWalletScreen}
          icon={ArrowIcon}
          showDivider
        />
        <SettingComponent
          text={t('RESET_WALLET')}
          onClick={openResetWalletPrompt}
          showWarningTitle
        />
        <SettingComponent
          title={t('ABOUT')}
          text={t('TERMS_OF_SERVICE')}
          onClick={openTermsOfService}
          icon={ArrowSquareOut}
          showDivider
        />
        <SettingComponent
          text={t('PRIVACY_POLICY')}
          onClick={openPrivacyPolicy}
          icon={ArrowSquareOut}
          showDivider
        />
        <SettingComponent
          text={t('SUPPORT_CENTER')}
          onClick={openSupport}
          icon={ArrowSquareOut}
          showDivider
        />
        <SettingComponent text={t('VERSION')} textDetail={VERSION} />
        <ResetWalletPrompt showResetWalletPrompt={showResetWalletPrompt} onResetWalletPromptClose={onResetWalletPromptClose} openResetWalletScreen={openResetWalletScreen} />
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default Setting;
