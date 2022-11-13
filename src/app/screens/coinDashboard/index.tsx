import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import styled from 'styled-components';
import { CurrencyTypes } from '@utils/constants';
import CoinHeader from './coinHeader';
import TransactionsHistoryList from './transactionsHitstoryList';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

export default function CoinDashboard() {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const { coin } = useParams();
  const [searchParams] = useSearchParams();
  const { coinsList } = useWalletSelector();
  const ftTicker = searchParams.get('ticker');

  const handleBack = () => {
    navigate(-1);
  };

  const ft = coinsList?.find((ftCoin) => ftCoin.ticker === ftTicker);

  const getDashboardTitle = () => {
    if (ftTicker && ftTicker !== 'undefined') {
      return ftTicker;
    }
    if (coin) {
      return coin;
    }
    return '';
  };

  return (
    <>
      <TopRow title={getDashboardTitle()} onClick={handleBack} />
      <Container>
        <CoinHeader coin={coin as CurrencyTypes} fungibleToken={ft} />
        <TransactionsHistoryList coin={coin as CurrencyTypes} fungibleToken={ft} />
      </Container>
    </>
  );
}
