import type { CondensedInscription, Inscription } from '@secretkeylabs/xverse-core';
import { getTextOrdinalContent } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import PQueue from 'p-queue';
import useWalletSelector from './useWalletSelector';

const queue = new PQueue({ concurrency: 1 });

const useTextOrdinalContent = (ordinal: Inscription | CondensedInscription) => {
  const { network } = useWalletSelector();
  const { data: textContent } = useQuery({
    queryKey: ['ordinal-text', ordinal?.id, network.type],
    queryFn: async () => queue.add(() => getTextOrdinalContent(network.type, ordinal?.id)),
    staleTime: 5 * 60 * 1000, // 5 min
  });

  return textContent?.toString();
};

export default useTextOrdinalContent;
