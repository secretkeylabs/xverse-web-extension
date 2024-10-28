import type { StoreState } from '@stores/index';
import { useSelector } from 'react-redux';

const useWalletSelector = () => {
  const walletState = useSelector((state: StoreState) => state.walletState);

  return {
    ...walletState,
  };
};

export default useWalletSelector;
