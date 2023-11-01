import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import ArrowIcon from '@assets/img/settings/arrow.svg';
import XverseLogo from '@assets/img/settings/logo.svg';
import PasswordInput from '@components/passwordInput';
import BottomBar from '@components/tabBar';
import useSeedVault from '@hooks/useSeedVault';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  ChangeActivateOrdinalsAction,
  ChangeActivateRareSatsAction,
} from '@stores/wallet/actions/actionCreators';
import { PRIVACY_POLICY_LINK, SUPPORT_LINK, TERMS_LINK } from '@utils/constants';
import { isLedgerAccount } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ResetWalletPrompt from '../../components/resetWallet';
import SettingComponent from './settingComponent';

declare const VERSION: string;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

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
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: props.theme.spacing(50),
}));

const LogoContainer = styled.div((props) => ({
  padding: props.theme.spacing(11),
  borderBottom: `1px solid ${props.theme.colors.elevation3}`,
}));

function Setting() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const [showResetWalletPrompt, setShowResetWalletPrompt] = useState<boolean>(false);
  const [showResetWalletDisplay, setShowResetWalletDisplay] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const {
    fiatCurrency,
    network,
    hasActivatedOrdinalsKey,
    hasActivatedRareSatsKey,
    selectedAccount,
  } = useWalletSelector();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { resetWallet } = useWalletReducer();
  const { unlockVault } = useSeedVault();

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

  const openPrivacyPreferencesScreen = () => {
    navigate('/privacy-preferences');
  };

  const openChangeNetworkScreen = () => {
    navigate('/change-network');
  };

  const openBackUpWalletScreen = () => {
    navigate('/backup-wallet');
  };

  const switchActivateOrdinalState = () => {
    dispatch(ChangeActivateOrdinalsAction(!hasActivatedOrdinalsKey));
    // disable rare sats if ordinal is disabled
    dispatch(ChangeActivateRareSatsAction(false));
  };

  const switchActivateRareSatsState = () => {
    dispatch(ChangeActivateRareSatsAction(!hasActivatedRareSatsKey));
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

  const openLockCountdownScreen = () => {
    navigate('/lockCountdown');
  };

  const onRestoreFundClick = async () => {
    if (isLedgerAccount(selectedAccount)) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('options.html#/restore-funds'),
      });
      return;
    }

    navigate('/restore-funds');
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

  return (
    <>
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
          text={t('PRIVACY_PREFERENCES.TITLE')}
          onClick={openPrivacyPreferencesScreen}
          icon={ArrowIcon}
          showDivider
        />
        {!isLedgerAccount(selectedAccount) && (
          <SettingComponent
            text={t('NETWORK')}
            onClick={openChangeNetworkScreen}
            textDetail={network.type}
          />
        )}

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
          text={t('LOCK_COUNTDOWN')}
          onClick={openLockCountdownScreen}
          icon={ArrowIcon}
          showDivider
        />
        <SettingComponent
          text={t('RESET_WALLET')}
          onClick={openResetWalletPrompt}
          showWarningTitle
        />
        <SettingComponent
          title={t('ADVANCED')}
          text={t('ACTIVATE_ORDINAL_NFTS')}
          toggle
          toggleFunction={switchActivateOrdinalState}
          toggleValue={hasActivatedOrdinalsKey}
          showDivider
        />
        <SettingComponent
          text={t('RECOVER_ASSETS')}
          onClick={onRestoreFundClick}
          icon={ArrowIcon}
          showDivider
          disabled={!hasActivatedOrdinalsKey}
        />

        <SettingComponent
          text={t('ENABLE_RARE_SATS')}
          description={t('ENABLE_RARE_SATS_DETAIL')}
          toggle
          toggleFunction={switchActivateRareSatsState}
          toggleValue={hasActivatedRareSatsKey}
          disabled={!hasActivatedOrdinalsKey}
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
        <SettingComponent text={`${t('VERSION')}`} textDetail={`${VERSION} (Beta)`} />
        <ResetWalletPrompt
          showResetWalletPrompt={showResetWalletPrompt}
          onResetWalletPromptClose={onResetWalletPromptClose}
          openResetWalletScreen={openResetWalletScreen}
        />
      </Container>

      <BottomBar tab="settings" />
    </>
  );
}

export default Setting;
