import styled from 'styled-components';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

function PrivacyPreferencesScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  return (
    <>
      <TopRow title={t('PRIVACY_PREFERENCES')} onClick={handleBackButtonClick} />
      <Container>Content</Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default PrivacyPreferencesScreen;
