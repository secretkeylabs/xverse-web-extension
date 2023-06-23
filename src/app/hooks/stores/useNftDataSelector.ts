import { StoreState } from '@stores/index';
import { useSelector } from 'react-redux';

const useNftDataSelector = () => {
  const nftDataState = useSelector((state: StoreState) => ({
    ...state.nftDataState,
  }));

  return {
    ...nftDataState,
  };
};

export default useNftDataSelector;
