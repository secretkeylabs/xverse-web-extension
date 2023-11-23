import { Inscription } from '@secretkeylabs/xverse-core';
import { BundleV2 } from '@utils/rareSats';

export interface NftDataState {
  selectedOrdinal: Inscription | null;
  selectedSatBundle: BundleV2 | null;
  selectedSatBundleItemIndex: number | null;
}

export const SetSelectedOrdinalKey = 'SetSelectedOrdinal';
export const SetSelectedSatBundleKey = 'SetSelectedSatBundle';
export const SetSelectedSatBundleItemIndexKey = 'SetSelectedSatBundleItemIndex';

export interface SetSelectedOrdinal {
  type: typeof SetSelectedOrdinalKey;
  selectedOrdinal: Inscription | null;
}

export interface SetSelectedSatBundle {
  type: typeof SetSelectedSatBundleKey;
  selectedSatBundle: NftDataState['selectedSatBundle'];
}
export interface SetSelectedSatBundleItemIndex {
  type: typeof SetSelectedSatBundleItemIndexKey;
  selectedSatBundleItemIndex: NftDataState['selectedSatBundleItemIndex'];
}

export type NftDataAction =
  | SetSelectedOrdinal
  | SetSelectedSatBundle
  | SetSelectedSatBundleItemIndex;
