import useNftDetail from '@hooks/queries/useNftDetail';
import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { GAMMA_URL, POPUP_WIDTH } from '@utils/constants';
import { getExplorerUrl, isInOptions, isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import { RoutePathsSuffixes } from 'app/routes/paths';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function useNftDetailScreen() {
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { id } = useParams();
  const { hiddenCollectibleIds } = useWalletSelector();
  const nftDetailQuery = useNftDetail(id!);
  const collectionId = nftDetailQuery.data?.data.collection_contract_id;
  const collectionHidden = Object.keys(hiddenCollectibleIds[selectedAccount.stxAddress] ?? {}).some(
    (itemId) => itemId === collectionId,
  );
  const nftCollectionsQuery = useStacksCollectibles(collectionHidden);
  const collection = nftCollectionsQuery.data?.results.find(
    (c) => c.collection_id === collectionId,
  );

  const metadata = nftDetailQuery.data?.data?.token_metadata;
  const gammaUrl = `${GAMMA_URL}collections/${metadata?.contract_id}/${nftDetailQuery.data?.data?.token_id}`;

  useResetUserFlow('/nft-detail');

  const isGalleryOpen: boolean = useMemo(
    () => document.documentElement.clientWidth > POPUP_WIDTH,
    [],
  );
  const galleryTitle = metadata?.name;

  const onSharePress = () => {
    navigator.clipboard.writeText(gammaUrl);
  };

  const handleBackButtonClick = () => {
    navigate(`/nft-dashboard/nft-collection/${collectionId}${collectionHidden ? '/hidden' : ''}`);
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
    if (
      (isLedgerAccount(selectedAccount) || isKeystoneAccount(selectedAccount)) &&
      !isInOptions()
    ) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(
          `options.html#/nft-dashboard/nft-detail/${id}${RoutePathsSuffixes.SendNft}`,
        ),
      });
      return;
    }
    navigate(`/nft-dashboard/nft-detail/${id}${RoutePathsSuffixes.SendNft}`);
  };

  return {
    nft: nftDetailQuery.data,
    nftData: nftDetailQuery.data?.data,
    collection,
    stxAddress: selectedAccount.stxAddress,
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
