/* eslint-disable import/prefer-default-export */
import { NftData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { Inscription } from '@secretkeylabs/xverse-core/types/api/ordinals';
import * as actions from './types';

export function setNftDataAction(nftData: NftData[]): actions.SetNftData {
  return {
    type: actions.SetNftDataKey,
    nftData,
  };
}

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
