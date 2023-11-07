import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useResetUserFlow from '@hooks/useResetUserFlow';
import { NonFungibleToken } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function useNftCollection() {
  const navigate = useNavigate();
  const { id: collectionId } = useParams();
  const stacksNftsQuery = useStacksCollectibles();
  const collectionData = stacksNftsQuery.data?.pages
    ?.map((page) => page?.results)
    .flat()
    .find((collection) => collection.collection_id === collectionId);

  const portfolioValue = collectionData?.floor_price
    ? collectionData.floor_price * collectionData.total_nft
    : null;

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  useResetUserFlow('/nft-collection');

  const handleBackButtonClick = () => {
    navigate('/nft-dashboard?tab=nfts');
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`options.html#/nft-dashboard/nft-collection/${collectionId}`),
    });
  };

  const handleOnClick = (nft: NonFungibleToken) => {
    if (collectionData?.collection_id !== 'bns') {
      navigate(`/nft-dashboard/nft-detail/${nft.data?.fully_qualified_token_id}`);
    }
  };

  return {
    collectionData,
    portfolioValue,
    isLoading: stacksNftsQuery.isLoading,
    isError: stacksNftsQuery.error,
    isEmpty:
      !stacksNftsQuery.isLoading && !stacksNftsQuery.error && collectionData?.total_nft === 0,
    isGalleryOpen,
    handleBackButtonClick,
    openInGalleryView,
    handleOnClick,
  };
}
