import type { CondensedInscription, Inscription } from '@secretkeylabs/xverse-core';
import { getTextOrdinalContent } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import PQueue from 'p-queue';
import useWalletSelector from './useWalletSelector';

const queue = new PQueue({ concurrency: 1 });

const useTextOrdinalContent = (ordinal?: Inscription | CondensedInscription) => {
  const { network } = useWalletSelector();
  const { data: textContent } = useQuery({
    enabled: !!ordinal?.id,
    queryKey: ['ordinal-text', ordinal?.id, network.type],
    queryFn: async () => {
      if (!ordinal?.id) return null;
      return (await queue.add(() => getTextOrdinalContent(network.type, ordinal?.id))) ?? null;
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });

  return textContent?.toString();
};

export default useTextOrdinalContent;
