import useWalletSelector from '@hooks/useWalletSelector';
import {
  getAddressUtxoOrdinalBundles,
  getUtxoOrdinalBundle,
  NetworkType,
} from '@secretkeylabs/xverse-core';
import { XVERSE_API_BASE_URL } from '@secretkeylabs/xverse-core/constant';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';
import { mapRareSatsAPIResponseToRareSats } from '@utils/rareSats';
import axios from 'axios';
import { mockData, mockTestCase1, mockTestCase3, Response } from './tempAddressRareSatsMock';

const PAGE_SIZE = 30;

// TODO: move this to xverse-core
export const getAddressUtxoOrdinalBundlesV2 = async (
  network: NetworkType,
  address: string,
  offset: number,
  limit: number,
  options?: {
    /** Filter out unconfirmed UTXOs */
    hideUnconfirmed?: boolean;
    /** Filter out UTXOs that only have one or more inscriptions (and no rare sats) */
    hideInscriptionOnly?: boolean;
  },
) => {
  const params: Record<string, unknown> = {
    offset,
    limit,
  };

  if (options?.hideUnconfirmed) {
    params.hideUnconfirmed = 'true';
  }
  if (options?.hideInscriptionOnly) {
    params.hideInscriptionOnly = 'true';
  }

  const response = await axios.get<Response>(
    `${XVERSE_API_BASE_URL(network)}/v2/address/${address}/ordinal-utxo`,
    {
      params,
    },
  );

  return response.data;
};

export const useAddressRareSatsV2 = () => {
  const { ordinalsAddress, network } = useWalletSelector();

  const getRareSatsByAddress = async ({ pageParam = 0 }) => {
    if (!ordinalsAddress) {
      throw new InvalidParamsError('ordinalsAddress is required');
    }

    // custom ordinal address takes precedence over mocks
    const customOrdinalAddress = localStorage.getItem('ordinalAddress');
    const useProdApi = localStorage.getItem('useProdApi');

    if (!(useProdApi || customOrdinalAddress)) {
      // EMPTY RESPONSE
      const testcase1 = localStorage.getItem('testcase1');
      if (testcase1) {
        return mockTestCase1;
      }

      // ERROR RESPONSE
      const testcase2 = localStorage.getItem('testcase2');
      if (testcase2) {
        throw new Error('Error response from API');
      }

      // 1 BUNDLE with 4 sat ranges
      const testcase3 = localStorage.getItem('testcase3');
      if (testcase3) {
        return mockTestCase3;
      }

      return mockData;
    }

    const bundleResponse = await getAddressUtxoOrdinalBundlesV2(
      network.type,
      customOrdinalAddress ?? ordinalsAddress,
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
