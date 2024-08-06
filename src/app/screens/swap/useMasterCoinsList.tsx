import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stx_icon.svg';
import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useWalletSelector from '@hooks/useWalletSelector';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
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
};

export const stxFt: FungibleToken = {
  name: 'Stacks',
  balance: '',
  total_sent: '',
  total_received: '',
  principal: 'STX',
  assetName: 'Stacks',
  image: IconStacks,
};

const useMasterCoinsList = () => {
  const { acceptableCoinList: sip10FtList } = useStxCurrencyConversion();
  const { unfilteredData: runesFtList } = useRuneFungibleTokensQuery();
  const { hideStx } = useWalletSelector();

  const coinsMasterList = useMemo(
    () => [...sip10FtList, ...(runesFtList || []), btcFt, ...(hideStx ? [] : [stxFt])] ?? [],
    [sip10FtList, runesFtList],
  );

  return coinsMasterList;
};

export default useMasterCoinsList;
