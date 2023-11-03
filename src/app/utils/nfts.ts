import { StacksCollectionData } from '@secretkeylabs/xverse-core';
import { NftData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';

export const getNftsTabGridItemSubText = (collection: StacksCollectionData) =>
  collection.total_nft > 1 ? `${collection.total_nft} Items` : '1 Item';

export const getNftFromStore = (nftData: NftData[], id: string) =>
  nftData.find((nftItem) => nftItem.fully_qualified_token_id === id);
