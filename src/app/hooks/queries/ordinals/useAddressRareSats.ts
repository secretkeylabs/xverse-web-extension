import useWalletSelector from '@hooks/useWalletSelector';
import { getAddressUtxoOrdinalBundles, getUtxoOrdinalBundle } from '@secretkeylabs/xverse-core';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';
import { mapRareSatsAPIResponseToRareSats } from '@utils/rareSats';

const PAGE_SIZE = 30;

export const useAddressRareSats = () => {
  const { ordinalsAddress, network } = useWalletSelector();

  const getRareSatsByAddress = async ({ pageParam = 0 }) => {
    if (!ordinalsAddress) {
      throw new InvalidParamsError('ordinalsAddress is required');
    }

    const bundleResponse = await getAddressUtxoOrdinalBundles(
      network.type,
      ordinalsAddress,
      pageParam,
      PAGE_SIZE,
      {
        hideUnconfirmed: true,
        hideInscriptionOnly: true,
      },
    );
    return bundleResponse;
  };

  return useInfiniteQuery(['rare-sats', ordinalsAddress], getRareSatsByAddress, {
    retry: handleRetries,
    getNextPageParam: (lastPage, allPages) => {
      const currentLength = allPages.map((page) => page.results).flat().length;
      if (currentLength < lastPage.total) {
        return currentLength;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 min
  });
};

export const useGetUtxoOrdinalBundle = (output?: string, shouldMakeTheCall?: boolean) => {
  const { network } = useWalletSelector();
  const getUtxoOrdinalBundleByOutput = async () => {
    if (!output) {
      throw new InvalidParamsError('output is required');
    }

    const [txid, vout] = output.split(':');
    const bundleResponse = await getUtxoOrdinalBundle(network.type, txid, parseInt(vout, 10));
    return bundleResponse;
  };

  const { data, isLoading } = useQuery({
    enabled: !!(output && shouldMakeTheCall),
    queryKey: ['rare-sats', output, network.type],
    queryFn: getUtxoOrdinalBundleByOutput,
    retry: handleRetries,
    staleTime: 1 * 60 * 1000, // 1 min
  });
  const bundle = data?.txid ? mapRareSatsAPIResponseToRareSats(data) : undefined;

  return {
    bundle,
    isPartOfABundle: (bundle?.items ?? []).length > 1,
    isLoading,
  };
};
