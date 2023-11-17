import { getNftDetail, NftDetailResponse, NonFungibleToken } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { getIdentifier } from '@utils/nfts';
import { handleRetries } from '@utils/query';

const useNftDetail = (id: string | NonFungibleToken['identifier']) => {
  const { tokenId, contractAddress, contractName } =
    typeof id === 'string' ? getIdentifier(id) : id;

  const fetchNft = (): Promise<NftDetailResponse> =>
    getNftDetail(tokenId, contractAddress, contractName);

  return useQuery({
    enabled: !!(id && tokenId && contractAddress && contractName),
    retry: handleRetries,
    queryKey: ['nft-detail', contractAddress, contractName, tokenId],
    queryFn: fetchNft,
    staleTime: 30 * 60 * 1000, // 30mins
  });
};

export default useNftDetail;
