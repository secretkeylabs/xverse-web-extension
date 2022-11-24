import { NftDetailResponse } from '@secretkeylabs/xverse-core/types';
import { setNftDataAction } from '@stores/nftData/actions/actionCreator';
import { useDispatch } from 'react-redux';
import useNftDataSelector from './useNftDataSelector';

const useNftDataReducer = () => {
  const { nftData } = useNftDataSelector();
  const dispatch = useDispatch();
  const storeNftData = (data:NftDetailResponse) => {
    if (data && !nftData.includes(data.data)) {
      const modifiedNftList = [...nftData];
      modifiedNftList.push(data.data);
      dispatch(setNftDataAction(modifiedNftList));
    }
  };
  return {
    storeNftData,
  };
};

export default useNftDataReducer;
