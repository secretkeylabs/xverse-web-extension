import useRunesApi from '@hooks/apiClients/useRunesApi';
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
  const runesApi = useRunesApi();
  const { ordinalsAddress } = useSelectedAccount();
  const queryFn = useCallback(async () => {
    if (network.type !== 'Mainnet') {
      return [];
    }
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
    return sortedRes;
  }, [network.type, runesApi, ordinalsAddress, runeName, filter]);
  return useQuery({
    refetchOnWindowFocus: backgroundRefetch,
    refetchOnReconnect: backgroundRefetch,
    queryKey: ['get-rune-utxos', ordinalsAddress, runeName, filter],
    enabled: Boolean(ordinalsAddress && runeName),
    queryFn,
  });
}
