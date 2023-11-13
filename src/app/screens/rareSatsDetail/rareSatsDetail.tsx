import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import AccountHeaderComponent from '@components/accountHeader';
import AlertMessage from '@components/alertMessage';
import ActionButton from '@components/button';
import RareSatAsset from '@components/rareSatAsset/rareSatAsset';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import WebGalleryButton from '@components/webGalleryButton';
import usePendingOrdinalTxs from '@hooks/queries/usePendingOrdinalTx';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowRight, ArrowUp, Circle } from '@phosphor-icons/react';
import Callout from '@ui-library/callout';
import { XVERSE_ORDIVIEW_URL } from '@utils/constants';
import {
  getBtcTxStatusUrl,
  getTruncatedAddress,
  isInOptions,
  isLedgerAccount,
} from '@utils/helper';
import {
  BundleItem,
  getBundleItemId,
  getBundleItemSubText,
  getRareSatsColorsByRareSatsType,
  getRareSatsLabelByType,
  getRarityLabelByRareSatsType,
} from '@utils/rareSats';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import OrdinalAttributeComponent from '../ordinalDetail/ordinalAttributeComponent';

interface DetailSectionProps {
  isGalleryOpen?: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  margin-left: 5%;
  margin-right: 5%;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SendButtonContainer = styled.div<DetailSectionProps>`
  width: ${(props) => (props.isGalleryOpen ? '222px' : '155px')};
`;

const BackButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(40),
}));

const ExtensionContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 8,
  marginBottom: 40,
  alignItems: 'center',
  flex: 1,
});

const RareSatsContainer = styled.div((props) => ({
  maxWidth: 450,
  width: '60%',
  display: 'flex',
  aspectRatio: '1',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  borderRadius: 8,
  marginBottom: props.theme.spacing(12),
}));

const ExtensionRareSatsContainer = styled.div<{ isInscription?: boolean }>((props) => ({
  maxHeight: props.isInscription ? 148 : 64,
  width: props.isInscription ? 148 : 64,
  display: 'flex',
  aspectRatio: '1',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginBottom: props.theme.spacing(12),
  marginTop: props.theme.spacing(12),
}));

const RareSatsTitleText = styled.h1((props) => ({
  ...props.theme.headline_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const RareSatsGalleryTitleText = styled.p((props) => ({
  ...props.theme.headline_l,
  color: props.theme.colors.white['0'],
  marginBottom: props.theme.spacing(12),
}));

const DescriptionText = styled.p((props) => ({
  ...props.theme.headline_l,
  color: props.theme.colors.white['0'],
  fontSize: 24,
  marginBottom: props.theme.spacing(16),
}));

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const RowContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(6),
  flexDirection: 'row',
}));

const ColumnContainer = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  width: '100%',
});

const DescriptionContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  marginLeft: props.theme.spacing(20),
  flexDirection: 'column',
  marginBottom: props.theme.spacing(30),
}));

const StyledWebGalleryButton = styled(WebGalleryButton)`
  color: ${(props) => props.theme.colors.white_200};
  margin-top: ${(props) => props.theme.space.xs};
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

const SatTypeText = styled.p<DetailSectionProps>((props) => ({
  ...props.theme[props.isGalleryOpen ? 'body_bold_l' : 'body_bold_m'],
  color: props.theme.colors.white['400'],
  textAlign: props.isGalleryOpen ? 'left' : 'center',
  textTransform: 'capitalize',
}));

const DetailSection = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: !props.isGalleryOpen ? 'row' : 'column',
  justifyContent: 'space-between',
  width: '100%',
}));

const RareSatRankingBadge = styled.div<{ bgColor: string }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: '30px',
  backgroundColor: props.bgColor,
  marginTop: props.theme.spacing(1),
  padding: '5px 10px',
}));

const RareSatRankingBadgeText = styled.div((props) => ({
  ...props.theme.body_medium_s,
  marginLeft: props.theme.spacing(4),
}));

const StyledCallout = styled(Callout)((props) => ({
  marginBottom: props.theme.space.l,
}));

const BundleRarityLinkContainer = styled.button<DetailSectionProps>((props) => ({
  marginTop: props.isGalleryOpen ? props.theme.space.l : props.theme.space.m,
  display: 'inline-flex',
  alignSelf: props.isGalleryOpen ? 'flex-start' : 'center',
  flexDirection: 'row',
  marginBottom: props.isGalleryOpen ? props.theme.spacing(14) : 0,
  alignItems: 'center',
  backgroundColor: 'transparent',
  color: props.theme.colors.white_0,
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
  ':hover': {
    color: props.theme.colors.action.classicLight,
    opacity: 0.6,
  },
}));
const BundleRarityTextLink = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  marginRight: props.theme.spacing(1),
}));
const ArrowRightIcon = styled(ArrowRight)((props) => ({
  color: props.theme.colors.white_200,
}));
const Divider = styled.div((props) => ({
  width: '100%',
  height: '1px',
  backgroundColor: props.theme.colors.white_900,
  marginTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(4),
}));
const Flex1 = styled.div(() => ({
  flex: 1,
  width: '100%',
}));
const ViewInExplorerButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  marginTop: props.theme.space.xxl,
  width: '100%',
}));

function RareSatsDetailScreen() {
  const { t } = useTranslation('translation');
  const navigate = useNavigate();
  const location = useLocation();
  const { ordinalsAddress, network, selectedAccount } = useWalletSelector();
  const { selectedSatBundle, selectedSatBundleItemIndex } = useNftDataSelector();
  const [showSendOridnalsAlert, setshowSendOridnalsAlert] = useState<boolean>(false);
  const { setSelectedSatBundleItemIndex } = useSatBundleDataReducer();
  useResetUserFlow('/rare-sats-detail');
  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  const bundle = selectedSatBundle!;
  const { isPending, pendingTxHash } = usePendingOrdinalTxs(bundle.txid);

  const itemIndex = selectedSatBundleItemIndex!;
  const item = bundle.items[itemIndex] as BundleItem | undefined;
  // when going back, selectedSatBundleItemIndex is set tu null and we don't want to render anything
  if (!item) {
    return null;
  }

  const isBundle = bundle.items.length < 2;
  const isUnknown = item?.type === 'unknown';
  const isInscription = item?.type === 'inscription' || item?.type === 'inscribed-sat';

  const handleBackButtonClick = () => {
    // only go back if there is history
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/nft-dashboard?tab=rareSats');
    }
    setSelectedSatBundleItemIndex(null);
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/nft-dashboard/rare-sats-detail'),
    });
  };

  const showAlert = () => {
    setshowSendOridnalsAlert(true);
  };

  const onCloseAlert = () => {
    setshowSendOridnalsAlert(false);
  };

  const handleSendRareSats = async () => {
    if (isPending) {
      return showAlert();
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

  const openInOrdinalsExplorer = () => {
    if (!isInscription) {
      return;
    }
    window.open(`${XVERSE_ORDIVIEW_URL(network.type)}/inscription/${item.inscription.id}`);
  };

  const { color, backgroundColor } = getRareSatsColorsByRareSatsType(item.rarity_ranking);

  const satsRanking = (
    <OrdinalAttributeComponent
      title={t('RARE_SATS.RARE_SATS_RANKING')}
      customValue={
        <RareSatRankingBadge bgColor={backgroundColor}>
          <Circle size={8} weight="fill" color={color} />
          <RareSatRankingBadgeText>
            {getRareSatsLabelByType(item.rarity_ranking)}
          </RareSatRankingBadgeText>
        </RareSatRankingBadge>
      }
    />
  );
  const satsValue = (
    <OrdinalAttributeComponent
      title={t('RARE_SATS.SATS_VALUE')}
      value={`${bundle.value}`}
      suffix=" sats"
    />
  );
  const satsRarity = (
    <OrdinalAttributeComponent
      title={t('RARE_SATS.RARITY')}
      value={getRarityLabelByRareSatsType(item.rarity_ranking)}
      isAddress
    />
  );
  const ownedBy = (
    <OrdinalAttributeComponent
      title={t('NFT_DETAIL_SCREEN.OWNED_BY')}
      value={getTruncatedAddress(ordinalsAddress, 6)}
      isAddress
    />
  );
  const id = (
    <OrdinalAttributeComponent title={t('NFT_DETAIL_SCREEN.ID')} value={bundle.txid} isAddress />
  );
  const title = getBundleItemId(bundle, itemIndex);
  const sendActionSection = isBundle ? (
    <>
      <SendButtonContainer isGalleryOpen={isGalleryOpen}>
        <ActionButton
          icon={<ArrowUp weight="bold" size="16" />}
          text={t('COMMON.SEND')}
          onPress={handleSendRareSats}
        />
      </SendButtonContainer>
      <BundleRarityLinkContainer onClick={handleRarityScale} isGalleryOpen={isGalleryOpen}>
        <BundleRarityTextLink>{t('RARE_SATS.RARITY_LINK_TEXT')}</BundleRarityTextLink>
        <ArrowRightIcon size={12} weight="bold" />
      </BundleRarityLinkContainer>
    </>
  ) : (
    <StyledCallout variant="info" bodyText={t('RARE_SATS.SEND_INDIVIDUAL_SAT_INFO')} />
  );

  const extensionView = (
    <ExtensionContainer>
      <SatTypeText>
        {getBundleItemSubText({ satType: item.type, rareSatsType: item.rarity_ranking })}
      </SatTypeText>
      <RareSatsTitleText>{title}</RareSatsTitleText>
      <StyledWebGalleryButton onClick={openInGalleryView} />
      <ExtensionRareSatsContainer isInscription={isInscription}>
        <RareSatAsset item={item} />
      </ExtensionRareSatsContainer>
      {sendActionSection}
      <Divider />
      <ColumnContainer>
        <DetailSection>
          {!isUnknown && <Flex1>{satsRanking}</Flex1>}
          <Flex1>{isBundle ? satsValue : satsRarity}</Flex1>
        </DetailSection>
        <DetailSection>
          {!isUnknown && isBundle && <Flex1>{satsRarity}</Flex1>}
          <Flex1>{isUnknown ? id : ownedBy}</Flex1>
        </DetailSection>
      </ColumnContainer>
      {isInscription && (
        <ViewInExplorerButton>
          <ActionButton
            text={t('NFT_DETAIL_SCREEN.VIEW_IN_ORDINALS_EXPLORER')}
            onPress={openInOrdinalsExplorer}
            transparent
          />
        </ViewInExplorerButton>
      )}
    </ExtensionContainer>
  );

  const galleryView = (
    <Container>
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
      <SatTypeText isGalleryOpen>
        {getBundleItemSubText({ satType: item.type, rareSatsType: item.rarity_ranking })}
      </SatTypeText>
      <RareSatsGalleryTitleText>{title}</RareSatsGalleryTitleText>
      {sendActionSection}
      <RowContainer>
        <RareSatsContainer>
          <RareSatAsset item={item} />
        </RareSatsContainer>
        <DescriptionContainer>
          <DescriptionText>{t('NFT_DETAIL_SCREEN.DESCRIPTION')}</DescriptionText>
          <ColumnContainer>
            <DetailSection>
              {!isUnknown && <Flex1>{satsRanking}</Flex1>}
              <Flex1>{isBundle ? satsValue : satsRarity}</Flex1>
            </DetailSection>
            <DetailSection>
              {!isUnknown && isBundle && <Flex1>{satsRarity}</Flex1>}
              <Flex1>{isUnknown ? id : ownedBy}</Flex1>
            </DetailSection>
          </ColumnContainer>
          {isInscription && (
            <ViewInExplorerButton>
              <ActionButton
                text={t('NFT_DETAIL_SCREEN.VIEW_IN_ORDINALS_EXPLORER')}
                onPress={openInOrdinalsExplorer}
                transparent
              />
            </ViewInExplorerButton>
          )}
        </DescriptionContainer>
      </RowContainer>
    </Container>
  );

  return (
    <>
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      ) : (
        <TopRow title="Item detail" onClick={handleBackButtonClick} />
      )}
      <Container>
        {showSendOridnalsAlert && (
          <AlertMessage
            title={t('NFT_DETAIL_SCREEN.ORDINAL_PENDING_SEND_TITLE')}
            onClose={onCloseAlert}
            buttonText={t('NFT_DETAIL_SCREEN.ORDINAL_PENDING_SEND_BUTTON')}
            onButtonClick={handleRedirectToTx}
            description={t('NFT_DETAIL_SCREEN.ORDINAL_PENDING_SEND_DESCRIPTION')}
          />
        )}
        {isGalleryOpen && selectedSatBundle !== null ? galleryView : extensionView}
      </Container>
      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
    </>
  );
}

export default RareSatsDetailScreen;
