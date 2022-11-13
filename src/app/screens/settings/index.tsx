import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useWalletSelector from '@hooks/useWalletSelector';
import XverseLogo from '@assets/img/settings/logo.svg';
import ArrowIcon from '@assets/img/settings/arrow.svg';
import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import CheckSquare from '@assets/img/settings/check_square.svg';
import BottomBar from '@components/tabBar';
import { PRIVACY_POLICY_LINK, TERMS_LINK, SUPPORT_LINK } from '@utils/constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PasswordInput from '@components/passwordInput';
import useWalletReducer from '@hooks/useWalletReducer';
import SettingComponent from './settingComponent';
import ResetWalletPrompt from './resetWallet/resetWalletPrompt';

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

const PasswordChangedSuccessContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(10),
  paddingRight: props.theme.spacing(10),
  paddingTop: props.theme.spacing(5),
  paddingBottom: props.theme.spacing(5),
  marginTop: props.theme.spacing(5),
  marginLeft: props.theme.spacing(13),
  marginRight: props.theme.spacing(13),
  marginBottom: props.theme.spacing(5),
  background: props.theme.colors.feedback.success,
  borderRadius: props.theme.radius(2),
  boxShadow: '0px 7px 16px -4px rgba(25, 25, 48, 0.25)',
}));

const PasswordChangedSuccessText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'center',
  color: props.theme.colors.background.elevation0,
}));

const Button = styled.button({
  background: 'none',
});

const ResetWalletContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(30),
  marginLeft: props.theme.spacing(13),
  marginRight: props.theme.spacing(13),

}));

const LogoContainer = styled.div((props) => ({
  padding: props.theme.spacing(11),
  borderBottom: `1px solid ${props.theme.colors.background.elevation3}`,
}));

function Setting() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const location = useLocation();
  const [passwordChangeSuccessMessage, setPasswordChangeSuccessMessage] = useState<boolean>(false);
  const [showResetWalletPrompt, setShowResetWalletPrompt] = useState<boolean>(false);
  const [showResetWalletDisplay, setShowResetWalletDisplay] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { fiatCurrency, network } = useWalletSelector();
  const navigate = useNavigate();
  const { unlockWallet, resetWallet } = useWalletReducer();

  useEffect(() => {
    if (location?.state?.passwordUpdated) {
      setPasswordChangeSuccessMessage(true);
    }
  }, [location]);

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
    setPasswordChangeSuccessMessage(true);
  };

  const openResetWalletScreen = () => {
    setShowResetWalletPrompt(false);
    setShowResetWalletDisplay(true);
    // navigate('/reset-wallet');
  };

  const openResetWalletPrompt = () => {
    setShowResetWalletPrompt(true);
  };

  const openDismissSuccessMessage = () => {
    setPasswordChangeSuccessMessage(false);
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

  const showSuccessMessage = (
    <PasswordChangedSuccessContainer>
      <img src={CheckSquare} alt="xverse logo" />
      <PasswordChangedSuccessText>{t('UPDATE_PASSWORD_SUCCESS')}</PasswordChangedSuccessText>
      <Button onClick={openDismissSuccessMessage}>
        <PasswordChangedSuccessText>{t('OK')}</PasswordChangedSuccessText>
      </Button>
    </PasswordChangedSuccessContainer>
  );

  return (

    showResetWalletDisplay ? (
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
    ) : (
      <>
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
        { passwordChangeSuccessMessage && showSuccessMessage}
        <BottomBar tab="settings" />
      </>
    )
  );
}

export default Setting;
