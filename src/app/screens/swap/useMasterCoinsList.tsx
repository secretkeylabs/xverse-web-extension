import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stx_icon.svg';
import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { useGetSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useHasFeature from '@hooks/useHasFeature';
import useWalletSelector from '@hooks/useWalletSelector';
import { FeatureId, type FungibleToken } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';

export const btcFt: FungibleToken = {
  name: 'Bitcoin',
  balance: '',
  total_sent: '',
  total_received: '',
  principal: 'BTC',
  assetName: 'Bitcoin',
  image: IconBitcoin,
  protocol: 'runes',
  decimals: 8,
};

export const stxFt: FungibleToken = {
  name: 'Stacks',
  balance: '',
  total_sent: '',
  total_received: '',
  principal: 'STX',
  assetName: 'Stacks',
  image: IconStacks,
  protocol: 'stacks',
  decimals: 8,
};

const useMasterCoinsList = () => {
  const { data: sip10FtList } = useGetSip10FungibleTokens();
  const { data: runesFtList } = useRuneFungibleTokensQuery();
  const { hideStx } = useWalletSelector();
  const isStacksSwapsEnabled = useHasFeature(FeatureId.STACKS_SWAPS);

  const coinsMasterList = useMemo(
    () => [
      ...(runesFtList || []),
      btcFt,
      ...(!hideStx && isStacksSwapsEnabled ? [stxFt, ...(sip10FtList ?? [])] : []),
    ],
    [runesFtList, hideStx, isStacksSwapsEnabled, sip10FtList],
  );

  return coinsMasterList;
};

export default useMasterCoinsList;
