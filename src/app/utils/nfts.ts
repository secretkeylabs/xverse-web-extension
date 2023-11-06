import { NftData, StacksCollectionData } from '@secretkeylabs/xverse-core';

export const getNftsTabGridItemSubText = (collection: StacksCollectionData) =>
  collection.total_nft > 1 ? `${collection.total_nft} Items` : '1 Item';

export const getNftFromStore = (nftData: NftData[], id: string) =>
  nftData.find((nftItem) => nftItem.fully_qualified_token_id === id);
