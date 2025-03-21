import AlertMessage from '@components/alertMessage';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import usePendingOrdinalTxs from '@hooks/queries/usePendingOrdinalTx';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowUp } from '@phosphor-icons/react';
import BundleContent from '@screens/rareSatsBundle/bundleContent';
import type { Bundle } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledHeading } from '@ui-library/common.styled';
import {
  getBtcTxStatusUrl,
  getTruncatedAddress,
  isInOptions,
  isKeystoneAccount,
  isLedgerAccount,
} from '@utils/helper';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import OrdinalAttributeComponent from '../ordinalDetail/ordinalAttributeComponent';
import {
  AttributesContainer,
  Container,
  DetailSection,
  Header,
  NoCollectiblesText,
  PageHeader,
  PageHeaderContent,
  SatRangeContainer,
  SeeRarityContainer,
  SendButtonContainer,
  StyledSeparator,
  StyledWebGalleryButton,
} from './index.styled';

function RareSatsBundle() {
  const { t } = useTranslation('translation');
  const navigate = useNavigate();
  const location = useLocation();
  const { source, runeId } = location.state || {};
  const selectedAccount = useSelectedAccount();
  const [searchParams] = useSearchParams();
  const { network } = useWalletSelector();
  const { selectedSatBundle: bundle } = useNftDataSelector();
  const { isPending, pendingTxId } = usePendingOrdinalTxs(bundle ?? undefined);
  const [showSendOrdinalsAlert, setShowSendOrdinalsAlert] = useState(false);
  const { setSelectedSatBundleDetails } = useSatBundleDataReducer();

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);
  const fromRunes = !!searchParams.get('fromRune') || source === 'RuneBundlesTab';
  const fromOrdinals = source === 'OrdinalDetail';
  const isEmpty = !bundle?.satRanges?.length;

  useResetUserFlow('/rare-sats-bundle');

  const handleBackButtonClick = () => {
    setSelectedSatBundleDetails(null);
    if (fromOrdinals) {
      return navigate(-1);
    }
    if (fromRunes) {
      return navigate(
        `/coinDashboard/FT?ftKey=${
          searchParams.get('fromRune') || runeId
        }&protocol=runes&secondaryTab=true`,
      );
    }
    return navigate('/nft-dashboard?tab=rareSats');
  };

  const openInGalleryView = async () => {
    let baseUrl = 'options.html#/nft-dashboard/rare-sats-bundle';
    const fromRune = searchParams.get('fromRune') || runeId;

    if (fromRune) {
      baseUrl += `?fromRune=${fromRune}`;
    }
    await chrome.tabs.create({ url: chrome.runtime.getURL(baseUrl) });
  };

  const onCloseAlert = () => setShowSendOrdinalsAlert(false);

  const handleSendOrdinal = async () => {
    if (isPending) {
      return setShowSendOrdinalsAlert(true);
    }
    const hasRune = !!(searchParams.get('fromRune') || runeId);
    const link = `/nft-dashboard/ordinal-detail/${bundle?.txid}/send-ordinal?isRareSat=true&vout=${
      bundle?.vout
    }${hasRune ? `&fromRune=${searchParams.get('fromRune') || runeId}` : ''}`;
    if (
      (isLedgerAccount(selectedAccount) || isKeystoneAccount(selectedAccount)) &&
      !isInOptions()
    ) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#${link}`),
      });
      return;
    }
    navigate(link);
  };

  const handleRedirectToTx = () => {
    if (pendingTxId) {
      window.open(getBtcTxStatusUrl(pendingTxId, network), '_blank', 'noopener,noreferrer');
    }
  };

  const handleRarityScale = () => navigate('/nft-dashboard/supported-rarity-scale');

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container isGalleryOpen={isGalleryOpen}>
        <PageHeader isGalleryOpen={isGalleryOpen}>
          <PageHeaderContent isGalleryOpen={isGalleryOpen}>
            <Header isGalleryOpen={isGalleryOpen}>
              <StyledHeading typography="headline_xs" color="white_0">
                {t('NFT_DASHBOARD_SCREEN.BUNDLE')}
              </StyledHeading>
              {!isGalleryOpen && <StyledWebGalleryButton onClick={openInGalleryView} />}
              <OrdinalAttributeComponent
                title={t('NFT_DETAIL_SCREEN.RARE_SATS')}
                value={bundle?.totalExoticSats.toString()}
                isAddress
              />
              <SendButtonContainer isGalleryOpen={isGalleryOpen}>
                <Button
                  icon={<ArrowUp weight="bold" size="16" />}
                  title={t('COMMON.SEND')}
                  onClick={handleSendOrdinal}
                />
              </SendButtonContainer>
            </Header>
            <AttributesContainer isGalleryOpen={isGalleryOpen}>
              <DetailSection>
                <OrdinalAttributeComponent
                  title={t('NFT_DETAIL_SCREEN.OWNED_BY')}
                  value={getTruncatedAddress(selectedAccount.ordinalsAddress, 6)}
                  isAddress
                />
                <OrdinalAttributeComponent
                  title={t('RARE_SATS.SATS_VALUE')}
                  value={`${bundle?.value}`}
                  suffix=" sats"
                />
              </DetailSection>
              <OrdinalAttributeComponent
                title={t('NFT_DETAIL_SCREEN.ID')}
                value={bundle?.txid}
                isAddress
              />
              {!isGalleryOpen && (
                <OrdinalAttributeComponent title={t('NFT_DETAIL_SCREEN.CONTENT')} />
              )}
            </AttributesContainer>
            {isEmpty && (
              <NoCollectiblesText>{t('NFT_DASHBOARD_SCREEN.NO_COLLECTIBLES')}</NoCollectiblesText>
            )}
            {!isGalleryOpen && (
              <SatRangeContainer isGalleryOpen={isGalleryOpen}>
                <BundleContent bundle={bundle as Bundle} />
              </SatRangeContainer>
            )}
          </PageHeaderContent>
        </PageHeader>
        {isGalleryOpen && <StyledSeparator />}
        {isEmpty && (
          <NoCollectiblesText>{t('NFT_DASHBOARD_SCREEN.NO_COLLECTIBLES')}</NoCollectiblesText>
        )}
        {isGalleryOpen && (
          <SatRangeContainer isGalleryOpen={isGalleryOpen}>
            <BundleContent bundle={bundle as Bundle} />
          </SatRangeContainer>
        )}
        <SeeRarityContainer isGalleryOpen={isGalleryOpen}>
          <Button
            title={t('RARE_SATS.RARITY_LINK_TEXT')}
            variant="secondary"
            onClick={handleRarityScale}
          />
        </SeeRarityContainer>
        {showSendOrdinalsAlert && (
          <AlertMessage
            title={t('NFT_DETAIL_SCREEN.ORDINAL_PENDING_SEND_TITLE')}
            onClose={onCloseAlert}
            buttonText={t('NFT_DETAIL_SCREEN.ORDINAL_PENDING_SEND_BUTTON')}
            onButtonClick={handleRedirectToTx}
            description={t('NFT_DETAIL_SCREEN.ORDINAL_PENDING_SEND_DESCRIPTION')}
          />
        )}
      </Container>
      <BottomTabBar tab="nft" />
    </>
  );
}

export default RareSatsBundle;
