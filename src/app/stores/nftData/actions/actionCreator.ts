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
