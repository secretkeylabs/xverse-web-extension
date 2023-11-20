import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import { getNftCollections, StacksCollectionList } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { handleRetries } from '@utils/query';

const useStacksCollectibles = () => {
  let { stxAddress } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();

  // TODO remove this after testing
  const testAddress = localStorage.getItem('stxAddress');
  if (testAddress) {
    stxAddress = testAddress;
  }

  const fetchNftCollections = (): Promise<StacksCollectionList> =>
    getNftCollections(stxAddress, selectedNetwork);

  return useQuery({
    enabled: !!stxAddress,
    retry: handleRetries,
    queryKey: ['nft-collection-data', stxAddress],
    queryFn: fetchNftCollections,
    staleTime: 5 * 60 * 1000, // 5mins
  });
};

export default useStacksCollectibles;
