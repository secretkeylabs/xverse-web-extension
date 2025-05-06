import useRunesApi from '@hooks/apiClients/useRunesApi';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { fetchPastBtcTransactions, type RuneInfo } from '@secretkeylabs/xverse-core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { handleRetries } from '@utils/query';
import BigNumber from 'bignumber.js';
import { useRuneFungibleTokensQuery } from './runes/useRuneFungibleTokensQuery';

const PAGE_SIZE = 25;

const useBtcTxHistory = () => {
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const xverseApiClient = useXverseApi();
  const { data: fullRunesCoinsList, isLoading: isRunesLoading } = useRuneFungibleTokensQuery();
  const runesApiClient = useRunesApi();

  const runesDictionary = new Map<string, RuneInfo>();
  fullRunesCoinsList?.forEach((ft) => {
    runesDictionary.set(ft.principal, {
      name: ft.name,
      symbol: ft.runeSymbol ?? '',
      divisibility: BigNumber(ft.decimals ?? 0),
      inscriptionId: ft.runeInscriptionId ?? '',
    });
  });

  const getPastBtcTransactions = ({ pageParam }: { pageParam: number }) =>
    fetchPastBtcTransactions({
      account: selectedAccount,
      xverseApiClient,
      runesApiClient,
      clientRunesInfo: runesDictionary,
      offset: pageParam,
      limit: PAGE_SIZE,
    });

  return useInfiniteQuery({
    queryKey: ['btc-tx-history', network.type, selectedAccount.btcAddresses.taproot.address],
    queryFn: getPastBtcTransactions,
    enabled: !isRunesLoading,
    retry: handleRetries,
    getNextPageParam: (lastpage, pages) => {
      const offset = pages.map((page) => page.transactions).flat().length;
      if (lastpage.transactions.length < PAGE_SIZE) {
        return null;
      }
      return offset;
    },
    staleTime: 10 * 1000, // 10 secs
    initialPageParam: 0,
  });
};

export default useBtcTxHistory;
