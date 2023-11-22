import { Inscription } from '@secretkeylabs/xverse-core';
import * as actions from './types';

export function setSelectedOrdinalAction(
  selectedOrdinal: Inscription | null,
): actions.SetSelectedOrdinal {
  return {
    type: actions.SetSelectedOrdinalKey,
    selectedOrdinal,
  };
}

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
