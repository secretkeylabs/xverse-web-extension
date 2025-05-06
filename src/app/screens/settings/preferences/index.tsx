import TopRow from '@components/topRow';
import useChromeLocalStorage from '@hooks/useChromeLocalStorage';
import useWalletSelector from '@hooks/useWalletSelector';
import { chromeLocalStorageKeys } from '@utils/chromeLocalStorage';
import { getLockCountdownLabel } from '@utils/helper';
import RoutePaths from 'app/routes/paths';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SettingComponent from '../settingComponent';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `0 ${props.theme.space.xs}`,
  ...props.theme.scrollbar,
}));

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  paddingTop: props.theme.space.xs,
  paddingBottom: props.theme.space.m,
}));

function Preferences() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { fiatCurrency, walletLockPeriod } = useWalletSelector();
  const navigate = useNavigate();
  const [isPriorityWallet, setIsPriorityWallet, isLoading] = useChromeLocalStorage<boolean | null>(
    chromeLocalStorageKeys.isPriorityWallet,
    true,
  );

  const switchIsPriorityWallet = () => {
    setIsPriorityWallet(!isPriorityWallet);
  };

  const openFiatCurrencyScreen = () => {
    navigate(RoutePaths.FiatCurrency);
  };

  const openLockCountdownScreen = () => {
    navigate(RoutePaths.LockCountdown);
  };

  const openPrivacyPreferencesScreen = () => {
    navigate(RoutePaths.PrivacyPreferences);
  };

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('CATEGORIES.PREFERENCES')}</Title>
        <SettingComponent
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
          showDivider
        />
        <SettingComponent
          text={t('XVERSE_DEFAULT')}
          description={t('XVERSE_DEFAULT_DESCRIPTION')}
          toggle
          toggleFunction={switchIsPriorityWallet}
          toggleValue={isPriorityWallet ?? undefined}
          isLoading={isLoading}
        />
      </Container>
    </>
  );
}

export default Preferences;
