import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useResetUserFlow from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import { NftData } from '@secretkeylabs/xverse-core';
import { GAMMA_URL } from '@utils/constants';
import { getExplorerUrl, isLedgerAccount } from '@utils/helper';
import { getNftFromStore } from '@utils/nfts';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function useNftDetail() {
  const navigate = useNavigate();
  const { stxAddress, selectedAccount } = useWalletSelector();
  const stacksNftsQuery = useStacksCollectibles();

  const { id } = useParams();
  const collectionId = id?.split('::') ?? '';
  const collectionInfo = stacksNftsQuery.data?.pages
    ?.map((page) => page?.results)
    .flat()
    .find((collection) => collection.collection_id === collectionId);

  const { nftData } = useNftDataSelector();
  const [nft, setNft] = useState<NftData | undefined>(undefined);
  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  useResetUserFlow('/nft-detail');

  useEffect(() => {
    if (id) {
      const data = getNftFromStore(nftData, id);
      setNft(data);
    }
  }, [nftData, id]);

  const onSharePress = () => {
    navigator.clipboard.writeText(
      `${GAMMA_URL}collections/${nft?.token_metadata?.contract_id}/${nft?.token_id}`,
    );
  };

  const handleBackButtonClick = () => {
    navigate(`/nft-dashboard/nft-collection/${collectionInfo?.collection_id}`);
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
    collectionInfo,
    stxAddress,
    // isLoading,
    isGalleryOpen,
    onSharePress,
    handleBackButtonClick,
    onGammaPress,
    onExplorerPress,
    openInGalleryView,
    handleOnSendClick,
  };
}
