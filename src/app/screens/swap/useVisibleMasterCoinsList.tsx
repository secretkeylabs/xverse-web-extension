import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useWalletSelector from '@hooks/useWalletSelector';
import { useMemo } from 'react';
import { btcFt, stxFt } from './useMasterCoinsList';

const useVisibleMasterCoinsList = () => {
  const { visible: sip10FtList } = useVisibleSip10FungibleTokens();
  const { visible: runesFtList } = useVisibleRuneFungibleTokens();

  const { hideStx } = useWalletSelector();

  const coinsMasterList = useMemo(
    () => [...sip10FtList, ...runesFtList, btcFt, ...(hideStx ? [] : [stxFt])] ?? [],
    [sip10FtList, runesFtList],
  );

  return coinsMasterList;
};

export default useVisibleMasterCoinsList;
