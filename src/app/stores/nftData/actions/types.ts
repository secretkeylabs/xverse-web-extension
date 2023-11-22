import { Inscription } from '@secretkeylabs/xverse-core/types/api/ordinals';
import { NftData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { BundleV2 } from '@utils/rareSats';

export interface NftDataState {
  nftData: NftData[];
  selectedOrdinal: Inscription | null;
  selectedSatBundle: BundleV2 | null;
  selectedSatBundleItemIndex: number | null;
}

export const SetNftDataKey = 'SetNftData';

export const SetSelectedOrdinalKey = 'SetSelectedOrdinal';

export const SetSelectedSatBundleKey = 'SetSelectedSatBundle';
export const SetSelectedSatBundleItemIndexKey = 'SetSelectedSatBundleItemIndex';

export interface SetNftData {
  type: typeof SetNftDataKey;
  nftData: NftData[];
}

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
  | SetNftData
  | SetSelectedOrdinal
  | SetSelectedSatBundle
  | SetSelectedSatBundleItemIndex;
