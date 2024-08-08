import useWalletSelector from '@hooks/useWalletSelector';
import { getLockCountdownLabel } from '@utils/helper';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SettingComponent from '../settingComponent';

function Preferences() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { fiatCurrency, walletLockPeriod } = useWalletSelector();
  const navigate = useNavigate();
  const openFiatCurrencyScreen = () => {
    navigate('/fiat-currency');
  };

  const openLockCountdownScreen = () => {
    navigate('/lockCountdown');
  };

  const openPrivacyPreferencesScreen = () => {
    navigate('/privacy-preferences');
  };

  return (
    <div>
      <h1>Preferences</h1>
      <SettingComponent
        title={t('GENERAL')}
        text={t('CURRENCY')}
        onClick={openFiatCurrencyScreen}
        textDetail={fiatCurrency}
        showDivider
      />
      <SettingComponent
        text={t('LOCK_COUNTDOWN')}
        onClick={openLockCountdownScreen}
        textDetail={getLockCountdownLabel(walletLockPeriod, t)}
        showDivider
      />
      <SettingComponent
        text={t('PRIVACY_PREFERENCES.TITLE')}
        onClick={openPrivacyPreferencesScreen}
        // icon={ArrowIcon}
        showDivider
      />
    </div>
  );
}

export default Preferences;
