import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stx_icon.svg';
import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useHasFeature from '@hooks/useHasFeature';
import useWalletSelector from '@hooks/useWalletSelector';
import { FeatureId, type FungibleToken } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import { useStxCurrencyConversion } from './useStxCurrencyConversion';

export const btcFt: FungibleToken = {
  name: 'Bitcoin',
  balance: '',
  total_sent: '',
  total_received: '',
  principal: 'BTC',
  assetName: 'Bitcoin',
  image: IconBitcoin,
  protocol: 'runes',
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
};

const useMasterCoinsList = () => {
  const { acceptableCoinList: sip10FtList } = useStxCurrencyConversion();
  const { unfilteredData: runesFtList } = useRuneFungibleTokensQuery();
  const { hideStx } = useWalletSelector();
  const isStacksSwapsEnabled = useHasFeature(FeatureId.STACKS_SWAPS);

  const coinsMasterList = useMemo(
    () =>
      [
        ...(runesFtList || []),
        btcFt,
        ...(!hideStx && isStacksSwapsEnabled ? [stxFt, ...sip10FtList] : []),
      ] ?? [],
    [sip10FtList, runesFtList],
  );

  return coinsMasterList;
};

export default useMasterCoinsList;
