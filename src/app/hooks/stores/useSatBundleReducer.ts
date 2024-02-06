import { setSelectedSatBundleAction } from '@stores/nftData/actions/actionCreator';
import { NftDataState } from '@stores/nftData/actions/types';
import { useDispatch } from 'react-redux';

const useSatBundleDataReducer = () => {
  const dispatch = useDispatch();

  const setSelectedSatBundleDetails = (data: NftDataState['selectedSatBundle']) => {
    dispatch(setSelectedSatBundleAction(data));
  };

  return {
    setSelectedSatBundleDetails,
  };
};

export default useSatBundleDataReducer;
