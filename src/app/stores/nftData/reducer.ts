import {
  NftDataAction,
  NftDataState,
  SetNftDataKey,
  SetSelectedOrdinalKey,
  SetSelectedSatBundleItemIndexKey,
  SetSelectedSatBundleKey,
} from './actions/types';

const initialNftDataState: NftDataState = {
  nftData: [],
  selectedOrdinal: null,
  selectedSatBundle: null,
  selectedSatBundleItemIndex: null,
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
