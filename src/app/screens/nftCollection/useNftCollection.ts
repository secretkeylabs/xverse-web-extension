import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useResetUserFlow from '@hooks/useResetUserFlow';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function useNftCollection() {
  const navigate = useNavigate();
  useResetUserFlow('/nft-collection');

  const { id: collectionId } = useParams();
  const { data, isLoading, error } = useStacksCollectibles();

  const collectionData = data?.results.find(
    (collection) => collection.collection_id === collectionId,
  );

  const portfolioValue =
    collectionData?.floor_price && !Number.isNaN(collectionData?.all_nfts?.length)
      ? collectionData.floor_price * collectionData.all_nfts.length
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

  return {
    collectionData,
    portfolioValue,
    isLoading,
    isError: error,
    isEmpty: !isLoading && !error && collectionData?.all_nfts.length === 0,
    isGalleryOpen,
    handleBackButtonClick,
    openInGalleryView,
  };
}
