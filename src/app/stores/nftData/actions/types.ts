import { Bundle } from '@secretkeylabs/xverse-core';

export interface NftDataState {
  selectedSatBundle: Bundle | null;
}

export const SetSelectedSatBundleKey = 'SetSelectedSatBundle';

export interface SetSelectedSatBundle {
  type: typeof SetSelectedSatBundleKey;
  selectedSatBundle: NftDataState['selectedSatBundle'];
}

export type NftDataAction = SetSelectedSatBundle;
