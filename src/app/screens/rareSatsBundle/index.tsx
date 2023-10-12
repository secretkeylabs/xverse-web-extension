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
import { GridContainer } from '@screens/nftDashboard/collectiblesTabs';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import { getBtcTxStatusUrl, isLedgerAccount } from '@utils/helper';
import { BundleItem } from '@utils/rareSats';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import OrdinalAttributeComponent from '../ordinalDetail/ordinalAttributeComponent';
import { RareSatsBundleGridItem } from './rareSatsBundleGridItem';

interface DetailSectionProps {
  isGalleryOpen?: boolean;
}

/* layout */
const Container = styled.div`
  overflow-y: auto;
`;

const PageHeader = styled.div<DetailSectionProps>`
  padding: ${(props) => props.theme.space.m};
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
  row-gap: ${(props) => props.theme.space.xl};
`;

const AttributesContainer = styled.div`
  max-width: 285px;
`;

const StyledSeparator = styled(Separator)`
  margin-bottom: ${(props) => props.theme.space.xxl};
`;

const StyledGridContainer = styled(GridContainer)`
  margin-top: ${(props) => props.theme.spacing(8)}px;
  padding: 0 ${(props) => props.theme.space.m};
  padding-bottom: ${(props) => props.theme.space.xl};
  max-width: 1224px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
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

function RareSatsBundle() {
  const { t } = useTranslation('translation');
  const navigate = useNavigate();
  const { network, selectedAccount } = useWalletSelector();
  const { selectedSatBundle: bundle } = useNftDataSelector();
  const { isPending, pendingTxHash } = usePendingOrdinalTxs(bundle?.txid);
  const [showSendOrdinalsAlert, setShowSendOrdinalsAlert] = useState<boolean>(false);
  const { setSelectedSatBundleDetails } = useSatBundleDataReducer();

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  useResetUserFlow('/rare-sats-bundle');

  const handleBackButtonClick = () => {
    navigate('/nft-dashboard?tab=rareSats');
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

    if (isLedgerAccount(selectedAccount)) {
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

  const isEmpty = !bundle?.items?.length;

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
                  <AssetDetailButtonText>
                    {t('NFT_DETAIL_SCREEN.MOVE_TO_ASSET_DETAIL')}
                  </AssetDetailButtonText>
                </>
              </Button>
            </BackButtonContainer>
          )}
          <PageHeaderContent isGalleryOpen={isGalleryOpen}>
            <div>
              <StyledP typography="body_bold_m" color="white_400">
                {t('RARE_SATS.RARE_SATS_BUNDLE')}
              </StyledP>
              <StyledHeading typography="headline_m" color="white_0">
                {t('NFT_DASHBOARD_SCREEN.TOTAL_ITEMS', { total: bundle?.items?.length })}
              </StyledHeading>
              {!isGalleryOpen && <StyledWebGalleryButton onClick={openInGalleryView} />}
              <SendButtonContainer isGalleryOpen={isGalleryOpen}>
                <ActionButton
                  icon={<ArrowUp weight="bold" size="16" />}
                  text={t('COMMON.SEND')}
                  onPress={handleSendOrdinal}
                />
              </SendButtonContainer>
              <BundleRarityLinkContainer onClick={handleRarityScale}>
                <StyledP typography="body_medium_m" color="currentColor">
                  {t('RARE_SATS.RARITY_LINK_TEXT')}
                </StyledP>
                <ArrowRight size={16} weight="bold" color="currentColor" />
              </BundleRarityLinkContainer>
            </div>
            <AttributesContainer>
              <OrdinalAttributeComponent
                title={t('RARE_SATS.SATS_VALUE')}
                value={`${bundle?.value}`}
                suffix=" sats"
              />
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
        <StyledGridContainer isGalleryOpen={isGalleryOpen}>
          {bundle?.items?.map((item: BundleItem, index) => (
            <RareSatsBundleGridItem
              key={index} // eslint-disable-line react/no-array-index-key
              itemIndex={index}
              item={item}
            />
          ))}
        </StyledGridContainer>
        {showSendOrdinalsAlert && (
          <AlertMessage
            title={t('ORDINAL_PENDING_SEND_TITLE')}
            onClose={onCloseAlert}
            buttonText={t('ORDINAL_PENDING_SEND_BUTTON')}
            onButtonClick={handleRedirectToTx}
            description={t('ORDINAL_PENDING_SEND_DESCRIPTION')}
          />
        )}
      </Container>
      {!isGalleryOpen && <BottomTabBar tab="nft" />}
    </>
  );
}

export default RareSatsBundle;
