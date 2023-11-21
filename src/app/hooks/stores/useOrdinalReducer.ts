import type { Inscription } from '@secretkeylabs/xverse-core';
import { setSelectedOrdinalAction } from '@stores/nftData/actions/actionCreator';
import { useDispatch } from 'react-redux';

const useOrdinalDataReducer = () => {
  const dispatch = useDispatch();

  const setSelectedOrdinalDetails = (data: Inscription | null) => {
    dispatch(setSelectedOrdinalAction(data));
  };

  return {
    setSelectedOrdinalDetails,
  };
};

export default useOrdinalDataReducer;
