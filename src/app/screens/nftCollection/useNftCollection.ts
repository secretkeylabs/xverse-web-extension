import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useResetUserFlow from '@hooks/useResetUserFlow';
import { NonFungibleToken } from '@secretkeylabs/xverse-core';
import { isBnsCollection } from '@utils/nfts';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function useNftCollection() {
  const navigate = useNavigate();
  useResetUserFlow('/nft-collection');

  const { id: collectionId } = useParams();
  const { data, isLoading, error } = useStacksCollectibles();

  const collectionData = data?.pages
    ?.map((page) => page?.results)
    .flat()
    .find((collection) => collection.collection_id === collectionId);

  const portfolioValue = collectionData?.floor_price
    ? collectionData.floor_price * collectionData.total_nft
    : null;

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  const handleBackButtonClick = () => {
    navigate('/nft-dashboard?tab=nfts');
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`options.html#/nft-dashboard/nft-collection/${collectionId}`),
    });
  };

  const handleOnClick = isBnsCollection(collectionData?.collection_id)
    ? undefined
    : (nft: NonFungibleToken) => {
        navigate(`/nft-dashboard/nft-detail/${nft.data?.fully_qualified_token_id}`);
      };

  return {
    collectionData,
    portfolioValue,
    isLoading,
    isError: error,
    isEmpty: !isLoading && !error && collectionData?.total_nft === 0,
    isGalleryOpen,
    handleBackButtonClick,
    openInGalleryView,
    handleOnClick,
  };
}
