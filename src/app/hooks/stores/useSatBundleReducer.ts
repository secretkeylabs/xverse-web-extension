import {
  setSelectedSatBundleAction,
  setSelectedSatBundleItemIndexAction,
} from '@stores/nftData/actions/actionCreator';
import { NftDataState } from '@stores/nftData/actions/types';
import { useDispatch } from 'react-redux';

const useSatBundleDataReducer = () => {
  const dispatch = useDispatch();

  const setSelectedSatBundleDetails = (data: NftDataState['selectedSatBundle']) => {
    dispatch(setSelectedSatBundleAction(data));
  };

  const setSelectedSatBundleItemIndex = (data: NftDataState['selectedSatBundleItemIndex']) => {
    dispatch(setSelectedSatBundleItemIndexAction(data));
  };

  return {
    setSelectedSatBundleDetails,
    setSelectedSatBundleItemIndex,
  };
};

export default useSatBundleDataReducer;
