import * as actions from './types';

export function setSelectedSatBundleAction(
  selectedSatBundle: actions.NftDataState['selectedSatBundle'],
): actions.SetSelectedSatBundle {
  return {
    type: actions.SetSelectedSatBundleKey,
    selectedSatBundle,
  };
}
