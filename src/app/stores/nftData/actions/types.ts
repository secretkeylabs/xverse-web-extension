import { Inscription } from '@secretkeylabs/xverse-core/types/api/ordinals';
import { NftData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';

export interface NftDataState {
  nftData: NftData[];
  selectedOrdinal: Inscription | null;
}

export const SetNftDataKey = 'SetNftData';

export const SetSelectedOrdinalKey = 'SetSelectedOrdinal';

export interface SetNftData {
  type: typeof SetNftDataKey;
  nftData: NftData[];
}

export interface SetSelectedOrdinal {
  type: typeof SetSelectedOrdinalKey;
  selectedOrdinal: Inscription | null;
}

export type NftDataAction = SetNftData | SetSelectedOrdinal;
