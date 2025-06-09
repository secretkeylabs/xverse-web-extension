import { isStarknetActive } from '@utils/constants';
import { useParams } from 'react-router-dom';
import Btc from './coins/btc';
import Other from './coins/other';
import Strk from './coins/strk';

export type Tab = 'first' | 'second' | 'third';

export default function CoinDashboard() {
  const { currency } = useParams();

  switch (currency) {
    case 'BTC':
      return <Btc />;
    case 'STRK': {
      return isStarknetActive ? <Strk /> : <div />;
    }
    default:
      // TODO: split this more. Other is currently doing too much
      return <Other />;
  }
}
