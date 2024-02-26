import * as actions from './types';

export function setSelectedSatBundleAction(
  selectedSatBundle: actions.NftDataState['selectedSatBundle'],
): actions.SetSelectedSatBundle {
  return {
    type: actions.SetSelectedSatBundleKey,
    selectedSatBundle,
  };
}

export function setSelectedSatBundleItemIndexAction(
  selectedSatBundleItemIndex: actions.NftDataState['selectedSatBundleItemIndex'],
): actions.SetSelectedSatBundleItemIndex {
  return {
    type: actions.SetSelectedSatBundleItemIndexKey,
    selectedSatBundleItemIndex,
  };
}
