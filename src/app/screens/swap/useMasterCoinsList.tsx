import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { useMemo } from 'react';
import { btcFt, stxFt } from './index';
import { useStxCurrencyConversion } from './useStxCurrencyConversion';

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
