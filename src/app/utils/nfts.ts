import { NftData, NonFungibleToken, StacksCollectionData } from '@secretkeylabs/xverse-core';

export const getNftsTabGridItemSubText = (collection: StacksCollectionData) =>
  collection.total_nft > 1 ? `${collection.total_nft} Items` : '1 Item';

export const isBnsCollection = (collectionId: string): boolean =>
  collectionId === 'SP000000000000000000002Q6VF78.bns';

// fully_qualified_token_id like:
// SP1E1RNN4JZ7T6Y0JVCSY2TH4918Z590P8JAB9HZM.radboy-first-feat::radboy-first-feat:64
export const getNftDataFromNftsCollectionData = (
  fully_qualified_token_id?: string,
  nftCollections?: StacksCollectionData[],
): {
  collectionId: string;
  collection?: StacksCollectionData;
  nft?: NonFungibleToken;
  nftData?: NftData;
} => {
  const collectionId = fully_qualified_token_id?.split('::')?.[0] ?? '';
  const collection = nftCollections?.find((c) => c.collection_id === collectionId);
  const nft = isBnsCollection(collectionId)
    ? collection?.all_nfts[0] // assume bns collections have 1 item
    : collection?.all_nfts.find(
        (n: NonFungibleToken) => n.data?.fully_qualified_token_id === fully_qualified_token_id,
      );

  return {
    collectionId,
    collection,
    nft,
    nftData: nft?.data,
  };
};
