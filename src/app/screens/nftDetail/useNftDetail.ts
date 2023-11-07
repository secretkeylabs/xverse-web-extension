import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useResetUserFlow from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
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
  const { collectionId, collection, nft } = getNftDataFromNftsCollectionData(id, nftCollections);

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  useResetUserFlow('/nft-detail');

  const onSharePress = () => {
    navigator.clipboard.writeText(
      `${GAMMA_URL}collections/${nft?.token_metadata?.contract_id}/${nft?.token_id}`,
    );
  };

  const handleBackButtonClick = () => {
    navigate(`/nft-dashboard/nft-collection/${collectionId}`);
  };

  const onGammaPress = () => {
    window.open(`${GAMMA_URL}collections/${nft?.token_metadata?.contract_id}`);
  };

  const onExplorerPress = () => {
    const address = nft?.token_metadata?.contract_id?.split('.')!;
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
    navigate('send-nft', {
      state: {
        nft,
      },
    });
  };

  return {
    nft,
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
  };
}
