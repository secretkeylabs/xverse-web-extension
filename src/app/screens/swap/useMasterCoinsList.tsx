import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
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
};

export const stxFt: FungibleToken = {
  name: 'Stacks',
  balance: '',
  total_sent: '',
  total_received: '',
  principal: 'STX',
  assetName: 'Stacks',
};

const useMasterCoinsList = () => {
  const { acceptableCoinList: sip10FtList } = useStxCurrencyConversion();
  const { unfilteredData: runesFtList } = useRuneFungibleTokensQuery();

  const coinsMasterList = useMemo(
    () => [...sip10FtList, ...(runesFtList || []), btcFt, stxFt] ?? [],
    [sip10FtList, runesFtList],
  );

  return coinsMasterList;
};

export default useMasterCoinsList;
