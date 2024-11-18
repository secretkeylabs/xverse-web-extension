import { useParams } from 'react-router-dom';
import Btc from './coins/btc';
import Other from './coins/other';

export type Tab = 'first' | 'second' | 'third';

export default function CoinDashboard() {
  const { currency } = useParams();

  switch (currency) {
    case 'BTC':
      return <Btc />;
    default:
      // TODO: split this more. Other is currently doing too much
      return <Other />;
  }
}
