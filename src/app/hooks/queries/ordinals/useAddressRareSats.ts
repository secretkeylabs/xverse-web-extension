import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  getAddressUtxoOrdinalBundles,
  getUtxoOrdinalBundle,
  mapRareSatsAPIResponseToBundle,
} from '@secretkeylabs/xverse-core';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { InvalidParamsError, handleRetries } from '@utils/query';

const PAGE_SIZE = 30;

export const useAddressRareSats = () => {
  const { ordinalsAddress } = useSelectedAccount();
  const { network } = useWalletSelector();

  const getRareSatsByAddress = async ({ pageParam }: { pageParam: number }) => {
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
        hideSpecialWithoutSatributes: true,
      },
    );
    return bundleResponse;
  };

  return useInfiniteQuery({
    queryKey: ['rare-sats', ordinalsAddress],
    queryFn: getRareSatsByAddress,
    retry: handleRetries,
    getNextPageParam: (lastPage, allPages) => {
      const currentLength = allPages.map((page) => page.results).flat().length;
      if (currentLength < lastPage.total) {
        return currentLength;
      }
    },

    staleTime: 1 * 60 * 1000, // 1 min
    initialPageParam: 0,
  });
};

export const useGetUtxoOrdinalBundle = (
  output?: string,
  shouldMakeTheCall?: boolean,
  ordinalNumber?: number,
) => {
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

  const bundle = data?.txid ? mapRareSatsAPIResponseToBundle(data) : undefined;
  const inscriptionRange = bundle?.satRanges.find((range) =>
    range.inscriptions.some((inscription) => inscription.inscription_number === ordinalNumber),
  );
  const ordinalSatributes =
    inscriptionRange?.satributes.filter((satribute) => satribute !== 'COMMON') ?? [];
  const exoticRangesCount = (bundle?.satributes.filter((range) => !range.includes('COMMON')) ?? [])
    .length;
  const isPartOfABundle = exoticRangesCount > ordinalSatributes.length;

  return {
    bundle,
    isPartOfABundle,
    ordinalSatributes,
    isLoading,
  };
};
