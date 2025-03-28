import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { POPUP_WIDTH } from '@utils/constants';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function useNftCollection() {
  const navigate = useNavigate();
  useResetUserFlow('/nft-collection');

  const { id: collectionId, from } = useParams();
  const comesFromHidden = from === 'hidden';
  const { data, isLoading, error } = useStacksCollectibles(comesFromHidden);
  const { hiddenCollectibleIds } = useWalletSelector();
  const { stxAddress } = useSelectedAccount();

  const collectionData = data?.results.find(
    (collection) => collection.collection_id === collectionId,
  );
  const collectionHidden = Object.keys(hiddenCollectibleIds[stxAddress] ?? {}).some(
    (id) => id === collectionId,
  );

  const portfolioValue =
    collectionData?.floor_price && !Number.isNaN(collectionData?.all_nfts?.length)
      ? collectionData.floor_price * collectionData.all_nfts.length
      : null;

  const isGalleryOpen: boolean = useMemo(
    () => document.documentElement.clientWidth > POPUP_WIDTH,
    [],
  );

  const handleBackButtonClick = () =>
    navigate(`/nft-dashboard${comesFromHidden || collectionHidden ? '/hidden' : ''}?tab=nfts`);

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(
        `options.html#/nft-dashboard/nft-collection/${collectionId}${
          comesFromHidden || collectionHidden ? '/hidden' : ''
        }`,
      ),
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
