import type { Bundle } from '@secretkeylabs/xverse-core';

export interface NftDataState {
  selectedSatBundle: Bundle | null;
  selectedSatBundleItemIndex: number | null;
}

export const SetSelectedSatBundleKey = 'SetSelectedSatBundle';
export const SetSelectedSatBundleItemIndexKey = 'SetSelectedSatBundleItemIndex';

export interface SetSelectedSatBundle {
  type: typeof SetSelectedSatBundleKey;
  selectedSatBundle: NftDataState['selectedSatBundle'];
}
export interface SetSelectedSatBundleItemIndex {
  type: typeof SetSelectedSatBundleItemIndexKey;
  selectedSatBundleItemIndex: NftDataState['selectedSatBundleItemIndex'];
}

export type NftDataAction = SetSelectedSatBundle | SetSelectedSatBundleItemIndex;
