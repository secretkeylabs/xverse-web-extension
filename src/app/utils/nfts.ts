import {
  getBnsNftName,
  type NonFungibleToken,
  type StacksCollectionData,
} from '@secretkeylabs/xverse-core';

export const getNftsTabGridItemSubText = (collection: StacksCollectionData) =>
  collection?.all_nfts?.length > 1 ? `${collection.all_nfts.length} Items` : '1 Item';

export const isBnsCollection = (collectionId?: string | null): boolean =>
  collectionId === 'SP000000000000000000002Q6VF78.bns' ||
  collectionId === 'ST000000000000000000002AMW42H.bns'; // testnet

export const isBnsContract = (assetIdentifier?: string): boolean =>
  assetIdentifier === 'SP000000000000000000002Q6VF78.bns::names' ||
  assetIdentifier === 'ST000000000000000000002AMW42H.bns::names'; // testnet

// fully_qualified_token_id like:
// SP1E1RNN4JZ7T6Y0JVCSY2TH4918Z590P8JAB9HZM.radboy-first-feat::radboy-first-feat:64
export const getFullyQualifiedKey = ({
  tokenId,
  contractName,
  contractAddress,
}: NonFungibleToken['identifier']) =>
  `${contractAddress}.${contractName}::${contractName}:${tokenId}`;

export const getIdentifier = (fullyQualifiedKey: string): NonFungibleToken['identifier'] => {
  const [principal, , contractName, tokenId] = fullyQualifiedKey.split(':');
  const [contractAddress] = principal.split('.');
  return {
    tokenId,
    contractName,
    contractAddress,
  };
};

export const getNftCollectionsGridItemId = (
  nft: NonFungibleToken,
  collectionData: StacksCollectionData,
) =>
  isBnsCollection(collectionData?.collection_id)
    ? getBnsNftName(nft)
    : nft?.identifier.tokenId
    ? `${collectionData?.collection_name} #${nft?.identifier.tokenId}`
    : `${collectionData?.collection_name}`;
