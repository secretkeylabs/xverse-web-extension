import { OrdinalInfo } from '@secretkeylabs/xverse-core';
import { NftData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';

export interface NftDataState {
  nftData: NftData[];
  ordinalsData: OrdinalInfo[];
}

export const SetNftDataKey = 'SetNftData';
export const SetOrdinalDataKey = 'SetOrdinalDataKey';

export interface SetNftData {
  type: typeof SetNftDataKey;
  nftData: NftData[];
}

export interface SetOrdinalData {
  type: typeof SetOrdinalDataKey;
  ordinalsData: OrdinalInfo[];
}

export type NftDataAction = SetNftData | SetOrdinalData;
