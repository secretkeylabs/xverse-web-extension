import { NftDataAction, NftDataState, SetNftDataKey, SetOrdinalDataKey } from './actions/types';

const initialNftDataState: NftDataState = {
  nftData: [],
  ordinalsData: [],
};

const NftDataStateReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: NftDataState = initialNftDataState,
  action: NftDataAction
): NftDataState => {
  switch (action.type) {
    case SetNftDataKey:
      return {
        ...state,
        nftData: action.nftData,
      };
    case SetOrdinalDataKey:
      return {
        ...state,
        ordinalsData: action.ordinalsData,
      };
    default:
      return state;
  }
};

export default NftDataStateReducer;
