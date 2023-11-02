import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useNftDataReducer from '@hooks/stores/useNftReducer';
import useResetUserFlow from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import { getNftDetail, NftDetailResponse } from '@secretkeylabs/xverse-core';
import { NftData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { useMutation } from '@tanstack/react-query';
import { GAMMA_URL } from '@utils/constants';
import { getExplorerUrl, isLedgerAccount } from '@utils/helper';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function useNftDetail() {
  const navigate = useNavigate();
  const { stxAddress, selectedAccount } = useWalletSelector();
  const stacksNftsQuery = useStacksCollectibles();

  const { id } = useParams();
  const nftIdDetails = id!.split('::');
  const collectionInfo = stacksNftsQuery.data?.pages
    ?.map((page) => page?.results)
    .flat()
    .find((collection) => collection.collection_id === nftIdDetails[0]);

  const { nftData } = useNftDataSelector();
  const { storeNftData } = useNftDataReducer();
  const [nft, setNft] = useState<NftData | undefined>(undefined);
  const {
    isLoading,
    data: nftDetailsData,
    mutate,
  } = useMutation<NftDetailResponse | undefined, Error, { principal: string }>({
    mutationFn: async ({ principal }) => {
      const contractInfo: string[] = principal.split('.');
      return getNftDetail(nftIdDetails[2].replace('u', ''), contractInfo[0], contractInfo[1]);
    },
  });
  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  useResetUserFlow('/nft-detail');

  useEffect(() => {
    const data = nftData.find((nftItem) => nftItem.fully_qualified_token_id === id);
    if (!data) {
      mutate({ principal: nftIdDetails[0] });
    } else {
      setNft(data);
    }
  }, []);

  const onSharePress = () => {
    navigator.clipboard.writeText(
      `${GAMMA_URL}collections/${nft?.token_metadata?.contract_id}/${nft?.token_id}`,
    );
  };

  useEffect(() => {
    if (nftDetailsData) {
      storeNftData(nftDetailsData.data);
      setNft(nftDetailsData?.data);
    }
  }, [nftDetailsData]);

  const handleBackButtonClick = () => {
    navigate('/nft-dashboard?tab=nfts');
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
