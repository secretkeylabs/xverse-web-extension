import { NftData } from '@secretkeylabs/xverse-core/types/api/gamma/currency';
import { setNftDataAction } from '@stores/nftData/actions/actionCreator';
import { useDispatch } from 'react-redux';
import useNftDataSelector from './useNftDataSelector';

const useNftDataReducer = () => {
  const { nftData } = useNftDataSelector();
  const dispatch = useDispatch();

  const storeNftData = (data:NftData) => {
    const nftExists = nftData.find((nftItem) => nftItem?.token_id === data?.token_id);
    if (data && !nftExists) {
      const modifiedNftList = [...nftData];
      modifiedNftList.push(data);
      dispatch(setNftDataAction(modifiedNftList));
    }
  };
  return {
    storeNftData,
  };
};

export default useNftDataReducer;
