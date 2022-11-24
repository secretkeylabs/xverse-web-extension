import { NftDataAction, NftDataState, SetNftDataKey } from './actions/types';

const initialNftDataState :NftDataState = {
  nftData: [],
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
    default:
      return state;
  }
};

export default NftDataStateReducer;
