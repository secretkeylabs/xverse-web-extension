import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useResetUserFlow from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBnsNftName } from '@secretkeylabs/xverse-core';
import { GAMMA_URL } from '@utils/constants';
import { getExplorerUrl, isLedgerAccount } from '@utils/helper';
import { getNftDataFromNftsCollectionData } from '@utils/nfts';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function useNftDetail() {
  const navigate = useNavigate();
  const { stxAddress, selectedAccount } = useWalletSelector();
  const { id } = useParams();
  const { data, isLoading } = useStacksCollectibles();
  const nftCollections = data?.pages?.map((page) => page?.results).flat();
  const { collectionId, collection, nft, nftData } = getNftDataFromNftsCollectionData(
    id,
    nftCollections,
  );
  const metaData = nft?.data?.token_metadata;
  const gammaUrl = `${GAMMA_URL}collections/${metaData?.contract_id}/${nft?.data?.token_id}`;

  useResetUserFlow('/nft-detail');

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);
  const galleryTitle =
    collectionId === 'bns' && nft ? getBnsNftName(nft) : nft?.data?.token_metadata.name;

  const onSharePress = () => {
    navigator.clipboard.writeText(gammaUrl);
  };

  const handleBackButtonClick = () => {
    navigate(`/nft-dashboard/nft-collection/${collectionId}`);
  };

  const onGammaPress = () => {
    window.open(gammaUrl);
  };

  const onExplorerPress = () => {
    const address = nft?.data?.token_metadata?.contract_id?.split('.')!;
    window.open(getExplorerUrl(address[0]));
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`options.html#/nft-dashboard/nft-detail/${id}`),
    });
  };

  const handleOnSendClick = async () => {
    if (isLedgerAccount(selectedAccount)) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#/send-nft/${id}`),
      });
      return;
    }
    navigate(`/nft-dashboard/nft-detail/${id}/send-nft`);
  };

  return {
    nft,
    nftData,
    collection,
    stxAddress,
    isLoading,
    isGalleryOpen,
    onSharePress,
    handleBackButtonClick,
    onGammaPress,
    onExplorerPress,
    openInGalleryView,
    handleOnSendClick,
    galleryTitle,
  };
}
