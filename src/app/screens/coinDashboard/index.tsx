import TopRow from '@components/topRow';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import styled from 'styled-components';
import { CurrencyTypes } from '@utils/constants';
import { getFtTicker } from '@utils/tokens';
import CoinHeader from './coinHeader';
import TransactionsHistoryList from './transactionsHistoryList';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  marginTop: props.theme.spacing(12),
  flexDirection: 'column',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

export default function CoinDashboard() {
  const navigate = useNavigate();
  const { coin } = useParams();
  const [searchParams] = useSearchParams();
  const { coinsList } = useWalletSelector();
  const ftAddress = searchParams.get('ft');

  const handleBack = () => {
    navigate(-1);
  };

  const ft = coinsList?.find((ftCoin) => ftCoin.principal === ftAddress);

  const getDashboardTitle = () => {
    if (ft) {
      return `${getFtTicker(ft)} Dashboard`;
    }
    if (coin) {
      return `${coin} Dashboard`;
    }
    return '';
  };

  return (
    <>
      <TopRow title={getDashboardTitle()} onClick={handleBack} />
      <Container>
        <CoinHeader coin={coin as CurrencyTypes} fungibleToken={ft} />
        <TransactionsHistoryList coin={coin as CurrencyTypes} txFilter={`${ft?.principal}::${ft?.assetName}`} />
      </Container>
    </>
  );
}
