import { OrdinalInfo } from '@secretkeylabs/xverse-core/types';
import { setOrdinalDataAction } from '@stores/nftData/actions/actionCreator';
import { useDispatch } from 'react-redux';
import useNftDataSelector from './useNftDataSelector';

const useOrdinalDataReducer = () => {
  const { ordinalsData } = useNftDataSelector();
  const dispatch = useDispatch();

  const storeOrdinalsMetaData = (data:OrdinalInfo) => {
    const ordinalExists = ordinalsData.find((ordinal) => ordinal?.metadata?.id === data?.metadata?.id);
    if (data && !ordinalExists) {
      const modifiedList = [...ordinalsData];
      modifiedList.push(data);
      dispatch(setOrdinalDataAction(modifiedList));
    }
  };

  return {
    storeOrdinalsMetaData,
  };
};

export default useOrdinalDataReducer;
