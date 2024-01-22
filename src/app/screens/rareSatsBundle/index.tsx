import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import AccountHeaderComponent from '@components/accountHeader';
import AlertMessage from '@components/alertMessage';
import ActionButton from '@components/button';
import Separator from '@components/separator';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import WebGalleryButton from '@components/webGalleryButton';
import usePendingOrdinalTxs from '@hooks/queries/usePendingOrdinalTx';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowRight, ArrowUp } from '@phosphor-icons/react';
import { BundleSatRange } from '@secretkeylabs/xverse-core';
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
import styled from 'styled-components';
import OrdinalAttributeComponent from '../ordinalDetail/ordinalAttributeComponent';
import { RareSatsBundleGridItem } from './rareSatsBundleGridItem';

interface DetailSectionProps {
  isGalleryOpen?: boolean;
}

/* layout */
const Container = styled.div`
  ...${(props) => props.theme.scrollbar};
  overflow-y: auto;
  padding-bottom: ${(props) => props.theme.space.l};
`;

const PageHeader = styled.div<DetailSectionProps>`
  padding: ${(props) => (props.isGalleryOpen ? props.theme.space.m : 0)};
  padding-top: 0;
  max-width: 1224px;
  margin-top: ${(props) => (props.isGalleryOpen ? props.theme.space.xxl : props.theme.space.l)};
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

// TODO tim: use media queries for this once we get responsive layouts with breakpoints
const PageHeaderContent = styled.div<DetailSectionProps>`
  display: flex;
  flex-direction: ${(props) => (props.isGalleryOpen ? 'row' : 'column')};
  justify-content: ${(props) => (props.isGalleryOpen ? 'space-between' : 'initial')};
`;

const AttributesContainer = styled.div<DetailSectionProps>((props) => ({
  maxWidth: props.isGalleryOpen ? '285px' : '100%',
  padding: props.isGalleryOpen ? 0 : `0 ${props.theme.space.m}`,
}));

const StyledSeparator = styled(Separator)`
  margin-bottom: ${(props) => props.theme.space.xxl};
`;

/* components */

const StyledWebGalleryButton = styled(WebGalleryButton)`
  color: ${(props) => props.theme.colors.white_200};
  margin-top: ${(props) => props.theme.space.xs};
`;

const SendButtonContainer = styled.div<DetailSectionProps>`
  margin-top: ${(props) => props.theme.space.l};
  width: ${(props) => (props.isGalleryOpen ? '222px' : '155px')};
`;

const BundleRarityLinkContainer = styled.button`
  margin-top: ${(props) => props.theme.space.l};
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${(props) => props.theme.space.xxs};
  background-color: transparent;
  color: ${(props) => props.theme.colors.white_200};
  :hover:enabled {
    color: ${(props) => props.theme.colors.white_200};
  }
  :active ;
  :disabled {
    color: ${(props) => props.theme.colors.white_400};
  }
  svg {
    flex-grow: 0;
    flex-shrink: 0;
  }
`;

const BackButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: ${(props) => props.theme.space.xxl};
`;

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: 'transparent',
  marginBottom: props.theme.spacing(12),
}));

const AssetDetailButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 400,
  fontSize: 14,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const NoCollectiblesText = styled.p((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(16),
  marginBottom: 'auto',
  textAlign: 'center',
}));

const Header = styled.div<{ isGalleryOpen: boolean }>((props) => ({
  display: props.isGalleryOpen ? 'block' : 'flex',
  flexDirection: props.isGalleryOpen ? 'row' : 'column',
  alignItems: props.isGalleryOpen ? 'flex-start' : 'center',
}));

const SatRangeContainer = styled.div<DetailSectionProps>((props) => ({
  marginTop: props.isGalleryOpen ? 0 : props.theme.space.xl,
  maxWidth: '1224px',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
}));

const DetailSection = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: props.isGalleryOpen ? 'column' : 'row',
  justifyContent: 'space-between',
  columnGap: props.theme.space.m,
  width: '100%',
}));

const SeeRarityContainer = styled.div`
  padding: ${(props) => props.theme.space.l} ${(props) => props.theme.space.m};
`;

function RareSatsBundle() {
  const { t } = useTranslation('translation');
  const navigate = useNavigate();
  const location = useLocation();
  const { source } = location.state || {};
  const { network, selectedAccount, ordinalsAddress } = useWalletSelector();
  const { selectedSatBundle: bundle, selectedOrdinal } = useNftDataSelector();
  const { isPending, pendingTxHash } = usePendingOrdinalTxs(bundle?.txid);
  const [showSendOrdinalsAlert, setShowSendOrdinalsAlert] = useState<boolean>(false);
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

    if (isLedgerAccount(selectedAccount) && !isInOptions()) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('options.html#/nft-dashboard/send-rare-sat'),
      });
      return;
    }

    navigate('/nft-dashboard/send-rare-sat');
  };

  const handleRedirectToTx = () => {
    if (pendingTxHash) {
      window.open(getBtcTxStatusUrl(pendingTxHash, network), '_blank', 'noopener,noreferrer');
    }
  };

  const handleRarityScale = () => {
    navigate('/nft-dashboard/supported-rarity-scale');
  };

  const isEmpty = !bundle?.satRanges?.length;

  const goBackText = selectedOrdinal?.id
    ? t('SEND.MOVE_TO_ASSET_DETAIL')
    : t('NFT_DETAIL_SCREEN.MOVE_TO_ASSET_DETAIL');

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
              <Button onClick={handleBackButtonClick}>
                <>
                  <ButtonImage src={ArrowLeft} />
                  <AssetDetailButtonText>{goBackText}</AssetDetailButtonText>
                </>
              </Button>
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
                <ActionButton
                  icon={<ArrowUp weight="bold" size="16" />}
                  text={t('COMMON.SEND')}
                  onPress={handleSendOrdinal}
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
                <ActionButton
                  text={t('RARE_SATS.RARITY_LINK_TEXT')}
                  transparent
                  onPress={handleRarityScale}
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
                  value={getTruncatedAddress(ordinalsAddress, 6)}
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
