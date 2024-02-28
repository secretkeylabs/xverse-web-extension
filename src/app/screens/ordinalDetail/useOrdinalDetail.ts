import useAddressInscription from '@hooks/queries/ordinals/useAddressInscription';
import { useGetUtxoOrdinalBundle } from '@hooks/queries/ordinals/useAddressRareSats';
import useInscriptionCollectionMarketData from '@hooks/queries/ordinals/useCollectionMarketData';
import usePendingOrdinalTxs from '@hooks/queries/usePendingOrdinalTx';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import useTextOrdinalContent from '@hooks/useTextOrdinalContent';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBrc20Details } from '@secretkeylabs/xverse-core';
import { XVERSE_ORDIVIEW_URL } from '@utils/constants';
import { getBtcTxStatusUrl, isInOptions, isLedgerAccount } from '@utils/helper';
import {
  getInscriptionsCollectionGridItemSubText,
  getInscriptionsCollectionGridItemSubTextColor,
} from '@utils/inscriptions';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from 'styled-components';

export default function useOrdinalDetail() {
  const navigate = useNavigate();
  const { ordinalsAddress, network, selectedAccount, hasActivatedRareSatsKey } =
    useWalletSelector();
  const { id } = useParams();
  const { data: ordinalData, isLoading } = useAddressInscription(id!);
  const { data: collectionMarketData } = useInscriptionCollectionMarketData(
    ordinalData?.collection_id,
  );

  const { isPending, pendingTxHash } = usePendingOrdinalTxs(ordinalData?.tx_id);
  const textContent = useTextOrdinalContent(ordinalData!);
  const { setSelectedSatBundleDetails } = useSatBundleDataReducer();
  const { bundle, isPartOfABundle, ordinalSatributes } = useGetUtxoOrdinalBundle(
    ordinalData?.output,
    hasActivatedRareSatsKey,
    ordinalData?.number,
  );
  const theme = useTheme();
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });

  const [showSendOridnalsAlert, setshowSendOridnalsAlert] = useState(false);

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  const brc20InscriptionStatus = getInscriptionsCollectionGridItemSubText(ordinalData);
  const brc20InscriptionStatusColor =
    theme.colors[getInscriptionsCollectionGridItemSubTextColor(ordinalData)];

  const brc20Details = useMemo(
    () => getBrc20Details(textContent ?? '', ordinalData?.content_type ?? ''),
    [textContent, ordinalData?.content_type],
  );

  const handleBackButtonClick = () => {
    if (ordinalData?.collection_id)
      navigate(`/nft-dashboard/ordinals-collection/${ordinalData?.collection_id}`);
    else navigate('/nft-dashboard?tab=inscriptions');
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`options.html#/nft-dashboard/ordinal-detail/${id}`),
    });
  };

  const showAlert = () => {
    setshowSendOridnalsAlert(true);
  };

  const onCloseAlert = () => {
    setshowSendOridnalsAlert(false);
  };

  const handleSendOrdinal = async () => {
    if (isPending) {
      showAlert();
      return;
    }
    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#/nft-dashboard/ordinal-detail/${id}/send-ordinal`),
      });
      return;
    }

    navigate('send-ordinal');
  };

  const handleRedirectToTx = () => {
    if (pendingTxHash) {
      window.open(getBtcTxStatusUrl(pendingTxHash, network), '_blank', 'noopener,noreferrer');
    }
  };

  const openInOrdinalsExplorer = () => {
    window.open(`${XVERSE_ORDIVIEW_URL(network.type)}/inscription/${ordinalData?.id}`);
  };

  const handleNavigationToRareSatsBundle = () => {
    if (!bundle || !ordinalData) {
      return;
    }
    setSelectedSatBundleDetails(bundle);
    navigate('/nft-dashboard/rare-sats-bundle', { state: { source: 'OrdinalDetail' } });
  };

  const onCopyClick = () => {
    navigator.clipboard.writeText(
      `${XVERSE_ORDIVIEW_URL(network.type)}/inscription/${ordinalData?.id}`,
    );
  };

  const backButtonText = ordinalData?.collection_id
    ? t('BACK_TO_COLLECTION')
    : t('MOVE_TO_ASSET_DETAIL');

  return {
    ordinal: ordinalData,
    collectionMarketData,
    isLoading,
    ordinalsAddress,
    showSendOridnalsAlert,
    brc20Details,
    isPartOfABundle: isPartOfABundle && hasActivatedRareSatsKey,
    ordinalSatributes: hasActivatedRareSatsKey ? ordinalSatributes : [],
    isGalleryOpen,
    brc20InscriptionStatus,
    brc20InscriptionStatusColor,
    handleSendOrdinal,
    onCloseAlert,
    handleBackButtonClick,
    openInGalleryView,
    handleRedirectToTx,
    openInOrdinalsExplorer,
    handleNavigationToRareSatsBundle,
    onCopyClick,
    backButtonText,
  };
}
