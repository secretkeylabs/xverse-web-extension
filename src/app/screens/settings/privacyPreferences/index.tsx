import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { hasOptedInMixPanelTracking, optInMixPanel, optOutMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Switch from 'react-switch';
import styled, { useTheme } from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflowY: 'auto',
  padding: props.theme.spacing(8),
  fontSize: '0.875rem',
  color: props.theme.colors.white['200'],
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const TextContainer = styled.div({
  lineHeight: '140%',
});

const SwitchContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: props.theme.spacing(16),
  fontWeight: 500,
}));

const CustomSwitch = styled(Switch)`
  .react-switch-handle {
    background-color: ${({ checked }) =>
      checked ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'} !important;
    border: ${({ checked }) => (checked ? '' : '4px solid rgba(255, 255, 255, 0.2)')} !important;
  }
`;

function PrivacyPreferencesScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const selectedAccount = useSelectedAccount();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  const handleSwitchChange = (checked: boolean) => {
    setIsEnabled(checked);

    if (checked) {
      optInMixPanel(selectedAccount.masterPubKey);
    } else {
      optOutMixPanel();
    }
  };

  const checkMixpanelTrackingStatus = async () => {
    const hasOptedIn = await hasOptedInMixPanelTracking();

    if (hasOptedIn) {
      setIsEnabled(true);
    }
  };

  useEffect(() => {
    checkMixpanelTrackingStatus();
  }, []);

  return (
    <>
      <TopRow title={t('PRIVACY_PREFERENCES.TITLE')} onClick={handleBackButtonClick} />
      <Container>
        <TextContainer>{t('PRIVACY_PREFERENCES.DESCRIPTION')}</TextContainer>
        <SwitchContainer>
          <div>{t('PRIVACY_PREFERENCES.AUTHORIZE_DATA_COLLECTION')}</div>
          <CustomSwitch
            onColor={theme.colors.orange_main}
            offColor={theme.colors.background.elevation3}
            onChange={handleSwitchChange}
            checked={isEnabled}
            uncheckedIcon={false}
            checkedIcon={false}
          />
        </SwitchContainer>
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default PrivacyPreferencesScreen;
