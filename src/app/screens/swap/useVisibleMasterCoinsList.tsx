import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useHasFeature from '@hooks/useHasFeature';
import useWalletSelector from '@hooks/useWalletSelector';
import { FeatureId } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import { btcFt, stxFt } from './useMasterCoinsList';

const useVisibleMasterCoinsList = () => {
  const { visible: sip10FtList } = useVisibleSip10FungibleTokens();
  const { visible: runesFtList } = useVisibleRuneFungibleTokens();
  const isStacksSwapsEnabled = useHasFeature(FeatureId.STACKS_SWAPS);

  const { hideStx } = useWalletSelector();

  const coinsMasterList = useMemo(
    () =>
      [
        ...sip10FtList,
        ...runesFtList,
        btcFt,
        ...(!hideStx && isStacksSwapsEnabled ? [stxFt] : []),
      ] ?? [],
    [sip10FtList, runesFtList, hideStx, isStacksSwapsEnabled],
  );

  return coinsMasterList;
};

export default useVisibleMasterCoinsList;
