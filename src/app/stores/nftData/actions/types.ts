import { NftData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';

export interface NftDataState {
  nftData: NftData[];
}

export const SetNftDataKey = 'SetNftData';

export interface SetNftData {
  type: typeof SetNftDataKey;
  nftData: NftData[];
}

export type NftDataAction = SetNftData;
