import { useNavigate } from 'react-router-dom';
import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import BottomBar from '@components/tabBar';

const Container = styled.div`
  display: flex;
  flex: 1;
`;

function SwapScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  return (
    <>
      <TopRow title={t('SWAP')} onClick={() => navigate('/')} />
      <Container />
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SwapScreen;
