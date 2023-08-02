import { NftDataAction, NftDataState, SetNftDataKey, SetSelectedOrdinalKey } from './actions/types';

const initialNftDataState: NftDataState = {
  nftData: [],
  selectedOrdinal: null,
};

const NftDataStateReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: NftDataState = initialNftDataState,
  action: NftDataAction,
): NftDataState => {
  switch (action.type) {
    case SetNftDataKey:
      return {
        ...state,
        nftData: action.nftData,
      };
    case SetSelectedOrdinalKey:
      return {
        ...state,
        selectedOrdinal: action.selectedOrdinal,
      };
    default:
      return state;
  }
};

export default NftDataStateReducer;
