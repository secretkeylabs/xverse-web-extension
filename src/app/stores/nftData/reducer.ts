import { NftDataAction, NftDataState, SetSelectedSatBundleKey } from './actions/types';

const initialNftDataState: NftDataState = {
  selectedSatBundle: null,
};

const NftDataStateReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: NftDataState = initialNftDataState,
  action: NftDataAction,
): NftDataState => {
  switch (action.type) {
    case SetSelectedSatBundleKey:
      return {
        ...state,
        selectedSatBundle: action.selectedSatBundle,
      };
    default:
      return state;
  }
};

export default NftDataStateReducer;
