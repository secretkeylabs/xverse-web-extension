import useRunesApi from '@hooks/useRunesApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export default function useRuneUtxosQuery(
  runeName: string,
  filter?: 'listed' | 'unlisted',
  backgroundRefetch = true,
) {
  const { network } = useWalletSelector();
  const { ordinalsAddress } = useSelectedAccount();
  if (network.type !== 'Mainnet') {
    throw new Error('Only available on Mainnet');
  }
  const runesApi = useRunesApi();
  const queryFn = useCallback(async () => {
    const res = await runesApi.getRunesUtxos({ address: ordinalsAddress, rune: runeName });
    const sortedRes = res.sort((a, b) => {
      const amountA = Number(a.runes?.[0][1].amount);
      const amountB = Number(b.runes?.[0][1].amount);
      return amountB - amountA;
    });
    if (filter === 'unlisted') {
      return sortedRes.filter((item) => item.listing[0] === null);
    }
    if (filter === 'listed') {
      return sortedRes.filter((item) => item.listing[0] !== null);
    }
  }, [runesApi, ordinalsAddress, filter, runeName]);
  return useQuery({
    refetchOnWindowFocus: backgroundRefetch,
    refetchOnReconnect: backgroundRefetch,
    queryKey: ['get-rune-utxos', ordinalsAddress, runeName, filter],
    enabled: Boolean(ordinalsAddress && runeName),
    queryFn,
  });
}
