import {
  SetSelectedSatBundleItemIndexKey,
  SetSelectedSatBundleKey,
  type NftDataAction,
  type NftDataState,
} from './actions/types';

const initialNftDataState: NftDataState = {
  selectedSatBundle: null,
  selectedSatBundleItemIndex: null,
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
    case SetSelectedSatBundleItemIndexKey:
      return {
        ...state,
        selectedSatBundleItemIndex: action.selectedSatBundleItemIndex,
      };
    default:
      return state;
  }
};

export default NftDataStateReducer;
