import BottomBar from '@components/tabBar';
import useWalletSelector from '@hooks/useWalletSelector';
import { SUPPORT_LINK } from '@utils/constants';
import RoutePaths from 'app/routes/paths';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SettingComponent from './settingComponent';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 ${(props) => props.theme.space.s};
  ${(props) => props.theme.scrollbar}
`;

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_l,
  marginTop: props.theme.space.xxl,
  marginBottom: props.theme.space.s,
}));

function Setting() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { network } = useWalletSelector();

  const navigate = useNavigate();

  const openSupport = () => {
    window.open(SUPPORT_LINK);
  };

  const openChangeNetworkScreen = () => {
    navigate(RoutePaths.ChangeNetwork);
  };

  const createNavigationHandler = (path: string) => () => {
    navigate(path);
  };

  const openPreferences = createNavigationHandler(RoutePaths.Preferences);
  const openSecurity = createNavigationHandler(RoutePaths.Security);
  const openAdvancedSettings = createNavigationHandler(RoutePaths.AdvancedSettings);
  const openAbout = createNavigationHandler(RoutePaths.About);
  const openConnectedAppsAndPermissionsScreen = createNavigationHandler(
    RoutePaths.ConnectedAppsAndPermissions,
  );
  const openAddressBook = createNavigationHandler(RoutePaths.AddressBook);

  return (
    <>
      <Container>
        <Title>{t('TITLE')} </Title>
        <SettingComponent
          text={t('CATEGORIES.PREFERENCES')}
          onClick={openPreferences}
          showDivider
        />
        <SettingComponent text={t('CATEGORIES.SECURITY')} onClick={openSecurity} showDivider />
        <SettingComponent
          text={t('CATEGORIES.CONNECTED_APPS')}
          onClick={openConnectedAppsAndPermissionsScreen}
          showDivider
        />
        <SettingComponent
          text={t('CATEGORIES.ADDRESS_BOOK')}
          onClick={openAddressBook}
          showDivider
        />
        <SettingComponent
          text={t('CATEGORIES.ADVANCED')}
          onClick={openAdvancedSettings}
          showDivider
        />
        <SettingComponent
          text={t('NETWORK')}
          onClick={openChangeNetworkScreen}
          textDetail={network.type === 'Testnet' ? 'Testnet3' : network.type}
          showDivider
        />

        <SettingComponent text={t('CATEGORIES.ABOUT')} onClick={openAbout} showDivider />
        <SettingComponent text={t('SUPPORT_CENTER')} onClick={openSupport} link />
      </Container>

      <BottomBar tab="settings" />
    </>
  );
}

export default Setting;
