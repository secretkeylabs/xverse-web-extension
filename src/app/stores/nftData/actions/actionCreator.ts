/* eslint-disable import/prefer-default-export */
import { NftData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import * as actions from './types';

export function setNftDataAction(nftData: NftData[]): actions.SetNftData {
  return {
    type: actions.SetNftDataKey,
    nftData,
  };
}
