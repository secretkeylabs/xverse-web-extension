import TopRow from '@components/topRow';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import styled from 'styled-components';
import { CurrencyTypes } from '@utils/constants';
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
  useBtcWalletData();

  const handleBack = () => {
    navigate(-1);
  };

  const ft = coinsList?.find((ftCoin) => ftCoin.principal === ftAddress);

  return (
    <>
      <TopRow title="" onClick={handleBack} />
      <Container>
        <CoinHeader coin={coin as CurrencyTypes} fungibleToken={ft} />
        <TransactionsHistoryList coin={coin as CurrencyTypes} txFilter={`${ft?.principal}::${ft?.assetName}`} />
      </Container>
    </>
  );
}
