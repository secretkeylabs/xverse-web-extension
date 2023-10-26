import { getTextOrdinalContent } from '@secretkeylabs/xverse-core/api/index';
import type { CondensedInscription, Inscription } from '@secretkeylabs/xverse-core/types';
import { useQuery } from '@tanstack/react-query';
import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 1 });

const useTextOrdinalContent = (ordinal: Inscription | CondensedInscription) => {
  const { data: textContent } = useQuery({
    queryKey: [`ordinal-text-${ordinal?.id}`],
    queryFn: async () => queue.add(() => getTextOrdinalContent(ordinal?.id)),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return textContent?.toString();
};

export default useTextOrdinalContent;
