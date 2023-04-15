import { useNavigate } from 'react-router-dom';
import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import BottomBar from '@components/tabBar';
import SwapTokenBlock from '@screens/swap/swapTokenBlock';
import ArrowDown from '@assets/img/swap/arrow_swap.svg';
import useCoinsData from '@hooks/queries/useCoinData';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  margin-left: 5%;
  margin-right: 5%;
`;

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: props.theme.spacing(8),
  marginTop: props.theme.spacing(16),
}));

const DownArrow = styled.img((props) => ({
  alignSelf: 'center',
  width: props.theme.spacing(18),
  height: props.theme.spacing(18),
}));

function SwapScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const { data } = useCoinsData();
  console.log(data?.sortedFtList);

  return (
    <>
      <TopRow title={t('SWAP')} onClick={() => navigate('/')} />
      <ScrollContainer>
        <Container>
          <SwapTokenBlock title={t('CONVERT')} />
          <DownArrow src={ArrowDown} />
          <SwapTokenBlock title={t('TO')} />
        </Container>
      </ScrollContainer>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SwapScreen;
