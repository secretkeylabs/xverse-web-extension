import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import AccountHeaderComponent from '@components/accountHeader';
import AlertMessage from '@components/alertMessage';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import usePendingOrdinalTxs from '@hooks/queries/usePendingOrdinalTx';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowRight, ArrowUp } from '@phosphor-icons/react';
import type { BundleSatRange } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import {
  getBtcTxStatusUrl,
  getTruncatedAddress,
  isInOptions,
  isLedgerAccount,
} from '@utils/helper';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import OrdinalAttributeComponent from '../ordinalDetail/ordinalAttributeComponent';
import {
  AssetDetailButtonText,
  AttributesContainer,
  BackButton,
  BackButtonContainer,
  BundleRarityLinkContainer,
  ButtonImage,
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
import { RareSatsBundleGridItem } from './rareSatsBundleGridItem';

function RareSatsBundle() {
  const { t } = useTranslation('translation');
  const navigate = useNavigate();
  const location = useLocation();
  const { source } = location.state || {};
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const { selectedSatBundle: bundle } = useNftDataSelector();
  const { isPending, pendingTxHash } = usePendingOrdinalTxs(bundle?.txid);
  const [showSendOrdinalsAlert, setShowSendOrdinalsAlert] = useState(false);
  const { setSelectedSatBundleDetails } = useSatBundleDataReducer();

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  useResetUserFlow('/rare-sats-bundle');

  const handleBackButtonClick = () => {
    if (source === 'OrdinalDetail') {
      navigate(-1);
    } else {
      navigate('/nft-dashboard?tab=rareSats');
    }
    setSelectedSatBundleDetails(null);
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/nft-dashboard/rare-sats-bundle'),
    });
  };

  const onCloseAlert = () => {
    setShowSendOrdinalsAlert(false);
  };

  const handleSendOrdinal = async () => {
    if (isPending) {
      return setShowSendOrdinalsAlert(true);
    }

    const link = `/nft-dashboard/ordinal-detail/${bundle?.txid}/send-ordinal?isRareSat=true&vout=${bundle?.vout}`;

    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#${link}`),
      });
      return;
    }

    navigate(link);
  };

  const handleRedirectToTx = () => {
    if (pendingTxHash) {
      window.open(getBtcTxStatusUrl(pendingTxHash, network), '_blank', 'noopener,noreferrer');
    }
  };

  const handleRarityScale = () => {
    navigate('/nft-dashboard/supported-rarity-scale');
  };

  const goBackText =
    location.state && location.state.source === 'OrdinalDetail'
      ? t('SEND.MOVE_TO_ASSET_DETAIL')
      : t('NFT_DETAIL_SCREEN.MOVE_TO_ASSET_DETAIL');

  const isEmpty = !bundle?.satRanges?.length;

  return (
    <>
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      ) : (
        <TopRow title={t('RARE_SATS.SATS_BUNDLE')} onClick={handleBackButtonClick} />
      )}
      <Container>
        <PageHeader isGalleryOpen={isGalleryOpen}>
          {isGalleryOpen && (
            <BackButtonContainer>
              <BackButton data-testid="back-button" onClick={handleBackButtonClick}>
                <>
                  <ButtonImage src={ArrowLeft} />
                  <AssetDetailButtonText>{goBackText}</AssetDetailButtonText>
                </>
              </BackButton>
            </BackButtonContainer>
          )}
          <PageHeaderContent isGalleryOpen={isGalleryOpen}>
            <Header isGalleryOpen={isGalleryOpen}>
              <StyledP typography="body_bold_m" color="white_400">
                {t('NFT_DASHBOARD_SCREEN.RARE_SATS')}
              </StyledP>
              <StyledHeading typography="headline_m" color="white_0">
                {bundle?.totalExoticSats}
              </StyledHeading>
              {!isGalleryOpen && <StyledWebGalleryButton onClick={openInGalleryView} />}
              <SendButtonContainer isGalleryOpen={isGalleryOpen}>
                <Button
                  icon={<ArrowUp weight="bold" size="16" />}
                  title={t('COMMON.SEND')}
                  onClick={handleSendOrdinal}
                />
              </SendButtonContainer>
              {isGalleryOpen && (
                <BundleRarityLinkContainer onClick={handleRarityScale}>
                  <StyledP typography="body_medium_m" color="currentColor">
                    {t('RARE_SATS.RARITY_LINK_TEXT')}
                  </StyledP>
                  <ArrowRight size={16} weight="bold" color="currentColor" />
                </BundleRarityLinkContainer>
              )}
            </Header>
            {isEmpty && (
              <NoCollectiblesText>{t('NFT_DASHBOARD_SCREEN.NO_COLLECTIBLES')}</NoCollectiblesText>
            )}
            {!isGalleryOpen && (
              <SatRangeContainer isGalleryOpen={isGalleryOpen}>
                {bundle?.satRanges.map((item: BundleSatRange) => (
                  <RareSatsBundleGridItem key={`${item.block}-${item.offset}`} item={item} />
                ))}
              </SatRangeContainer>
            )}
            {!isGalleryOpen && (
              <SeeRarityContainer>
                <Button
                  title={t('RARE_SATS.RARITY_LINK_TEXT')}
                  variant="secondary"
                  onClick={handleRarityScale}
                />
              </SeeRarityContainer>
            )}
            <AttributesContainer isGalleryOpen={isGalleryOpen}>
              <DetailSection>
                <OrdinalAttributeComponent
                  title={t('RARE_SATS.SATS_VALUE')}
                  value={`${bundle?.value}`}
                  suffix=" sats"
                />
                <OrdinalAttributeComponent
                  title={t('NFT_DETAIL_SCREEN.OWNED_BY')}
                  value={getTruncatedAddress(selectedAccount.ordinalsAddress, 6)}
                  isAddress
                />
              </DetailSection>
              <OrdinalAttributeComponent
                title={t('NFT_DETAIL_SCREEN.ID')}
                value={bundle?.txid}
                isAddress
              />
            </AttributesContainer>
          </PageHeaderContent>
        </PageHeader>
        {isGalleryOpen && <StyledSeparator />}
        {isEmpty && (
          <NoCollectiblesText>{t('NFT_DASHBOARD_SCREEN.NO_COLLECTIBLES')}</NoCollectiblesText>
        )}
        {isGalleryOpen && (
          <SatRangeContainer isGalleryOpen={isGalleryOpen}>
            {bundle?.satRanges.map((item: BundleSatRange) => (
              <RareSatsBundleGridItem key={`${item.block}-${item.offset}`} item={item} />
            ))}
          </SatRangeContainer>
        )}
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
      {!isGalleryOpen && <BottomTabBar tab="nft" />}
    </>
  );
}

export default RareSatsBundle;
