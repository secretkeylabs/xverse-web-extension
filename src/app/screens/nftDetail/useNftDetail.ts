import useNftDetail from '@hooks/queries/useNftDetail';
import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useResetUserFlow from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import { GAMMA_URL } from '@utils/constants';
import { getExplorerUrl, isInOptions, isLedgerAccount } from '@utils/helper';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function useNftDetailScreen() {
  const navigate = useNavigate();
  const { stxAddress, selectedAccount } = useWalletSelector();
  const { id } = useParams();

  const nftDetailQuery = useNftDetail(id!);
  const nftCollectionsQuery = useStacksCollectibles();
  const collectionId = nftDetailQuery.data?.data.collection_contract_id;
  const collection = nftCollectionsQuery.data?.results.find(
    (c) => c.collection_id === collectionId,
  );

  const metadata = nftDetailQuery.data?.data?.token_metadata;
  const gammaUrl = `${GAMMA_URL}collections/${metadata?.contract_id}/${nftDetailQuery.data?.data?.token_id}`;

  useResetUserFlow('/nft-detail');

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);
  const galleryTitle = metadata?.name;

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
    const address = metadata?.contract_id?.split('.')!;
    window.open(getExplorerUrl(address[0]));
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`options.html#/nft-dashboard/nft-detail/${id}`),
    });
  };

  const handleOnSendClick = async () => {
    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#/nft-dashboard/nft-detail/${id}/send-nft`),
      });
      return;
    }
    navigate(`/nft-dashboard/nft-detail/${id}/send-nft`);
  };

  return {
    nft: nftDetailQuery.data,
    nftData: nftDetailQuery.data?.data,
    collection,
    stxAddress,
    isLoading: nftDetailQuery.isLoading,
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
