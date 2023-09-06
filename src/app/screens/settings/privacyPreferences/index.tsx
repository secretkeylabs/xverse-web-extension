import styled, { useTheme } from 'styled-components';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Switch from 'react-switch';
import mixpanel from 'mixpanel-browser';
import useWalletSelector from '@hooks/useWalletSelector';
import { sha256 } from 'js-sha256';
import { ChangeActivateDataCollectionAction } from '@stores/wallet/actions/actionCreators';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CustomSwitch = styled(Switch)`
  .react-switch-handle {
    background-color: ${({ checked }) =>
      checked ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'} !important;
    border: ${({ checked }) => (checked ? '' : '4px solid rgba(255, 255, 255, 0.2)')} !important;
  }
`;

function PrivacyPreferencesScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { selectedAccount, hasActivatedDataCollection } = useWalletSelector();

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  const handleSwitchChange = () => {
    dispatch(ChangeActivateDataCollectionAction(!hasActivatedDataCollection));
  };

  useEffect(() => {
    if (!selectedAccount || !hasActivatedDataCollection) {
      return;
    }

    mixpanel.identify(sha256(selectedAccount.masterPubKey));
  }, [selectedAccount, hasActivatedDataCollection]);

  return (
    <>
      <TopRow title={t('PRIVACY_PREFERENCES')} onClick={handleBackButtonClick} />
      <Container>
        <div>
          Help improve the app experience, by allowing Xverse to collect anonymized usage data. This
          data cannot be used to identify your wallet individually.
        </div>
        <div>
          <div>Authorize data collection</div>
          <CustomSwitch
            onColor={theme.colors.purple_main}
            offColor={theme.colors.background.elevation3}
            onChange={handleSwitchChange}
            checked={hasActivatedDataCollection ?? false}
            uncheckedIcon={false}
            checkedIcon={false}
          />
        </div>
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default PrivacyPreferencesScreen;
