import BottomBar from '@components/tabBar';
import useWalletSelector from '@hooks/useWalletSelector';
import { SUPPORT_LINK } from '@utils/constants';
import { getLockCountdownLabel, isInOptions, isLedgerAccount } from '@utils/helper';
import RoutePaths from 'app/routes/paths';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SettingComponent from './settingComponent';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 ${(props) => props.theme.space.xs};
  ${(props) => props.theme.scrollbar}
`;

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_l,
  paddingTop: props.theme.space.xxl,
  paddingBottom: props.theme.space.xl,
}));

type SettingOptions = {
  title: string;
  text?: string;
  textDetail?: string;
  onClick?: () => void;
  showDivider?: boolean;
  showWarningTitle?: boolean;
  icon?: string;
};

function Setting() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const { network } = useWalletSelector();

  const navigate = useNavigate();

  const SettingsOptions: SettingOptions[] = [
    {
      title: 'Preferences',
      text: 'Option 1 Text',
      onClick: () => {
        // Handle Option 1 click
      },
      showDivider: true,
    },
    {
      title: 'Security',
      text: 'Option 2 Text',
      onClick: () => {
        // Handle Option 2 click
      },
      showDivider: true,
    },
    {
      title: 'Connected apps',
      text: 'Option 3 Text',
      onClick: () => {
        // Handle Option 3 click
      },
      showDivider: true,
    },
    {
      title: 'Advanced',
      text: 'Option 4 Text',
      onClick: () => {
        // Handle Option 4 click
      },
      showDivider: true,
    },
    {
      title: 'Network',
      text: 'Mainnet',
      onClick: () => {
        // Handle Option 5 click
      },
      showDivider: true,
    },
    {
      title: 'About',
      text: 'Option 6 Text',
      onClick: () => {
        // Handle Option 6 click
      },
      showDivider: true,
    },
    {
      title: 'Support Center',
      text: 'Option 7 Text',
      onClick: () => {
        // Handle Option 6 click
      },
      showDivider: true,
    },
  ];

  const openSupport = () => {
    window.open(SUPPORT_LINK);
  };

  const openChangeNetworkScreen = () => {
    navigate('/change-network');
  };

  const openConnectedAppsAndPermissionsScreen = () => {
    navigate(RoutePaths.ConnectedAppsAndPermissions);
  };

  return (
    <>
      <Container>
        <Title>{t('TITLE')} </Title>
        <SettingComponent
          text={t('CATEGORIES.PREFERENCES')}
          onClick={() => navigate(RoutePaths.Preferences)}
          showDivider
        />
        <SettingComponent
          text={t('CATEGORIES.SECURITY')}
          onClick={() => navigate(RoutePaths.Security)}
          showDivider
        />
        {process.env.NODE_ENV !== 'production' && (
          <SettingComponent
            text="Connected apps & permissions"
            onClick={openConnectedAppsAndPermissionsScreen}
            // icon={ArrowIcon}
            showDivider
          />
        )}
        <SettingComponent
          text={t('CATEGORIES.ADVANCED')}
          onClick={() => navigate(RoutePaths.AdvancedSettings)}
          showDivider
        />
        <SettingComponent
          text={t('NETWORK')}
          onClick={openChangeNetworkScreen}
          textDetail={network.type}
          showDivider
        />

        <SettingComponent
          text={t('CATEGORIES.ABOUT')}
          onClick={() => navigate(RoutePaths.About)}
          showDivider
        />
        <SettingComponent
          text={t('SUPPORT_CENTER')}
          onClick={openSupport}
          link="l"
          // icon={ArrowSquareOut}
        />
      </Container>

      <BottomBar tab="settings" />
    </>
  );
}

export default Setting;
