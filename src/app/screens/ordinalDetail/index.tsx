import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import AccountHeaderComponent from '@components/accountHeader';
import AlertMessage from '@components/alertMessage';
import { BetterBarLoader } from '@components/barLoader';
import ActionButton from '@components/button';
import CollectibleDetailTile from '@components/collectibleDetailTile';
import Separator from '@components/separator';
import SquareButton from '@components/squareButton';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import WebGalleryButton from '@components/webGalleryButton';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import { ArrowRight, ArrowUp, CubeTransparent, Share } from '@phosphor-icons/react';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';
import OrdinalAttributeComponent from './ordinalAttributeComponent';
import useOrdinalDetail from './useOrdinalDetail';

interface DetailSectionProps {
  isGallery: boolean;
}

const GalleryScrollContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
}));

const GalleryContainer = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  maxWidth: 1224,
});

const BackButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  width: 820,
  marginTop: props.theme.spacing(40),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  position: 'relative',
  flexDirection: 'row',
  maxWidth: 400,
  columnGap: props.theme.spacing(8),
  marginBottom: props.theme.spacing(10.5),
}));

const ExtensionContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(4),
  alignItems: 'center',
  flex: 1,
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
}));

const OrdinalsContainer = styled.div((props) => ({
  width: 376.5,
  height: 376.5,
  display: 'flex',
  aspectRatio: '1',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  borderRadius: 8,
  marginBottom: props.theme.spacing(12),
}));

const ExtensionOrdinalsContainer = styled.div((props) => ({
  maxHeight: 136,
  width: 136,
  display: 'flex',
  aspectRatio: '1',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  marginBottom: props.theme.spacing(12),
  marginTop: props.theme.spacing(12),
}));

const OrdinalTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_m,
  color: props.theme.colors.white_0,
  marginTop: props.theme.spacing(1),
  textAlign: 'center',
}));

const OrdinalGalleryTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_l,
  color: props.theme.colors.white_0,
}));

const DescriptionText = styled.h1((props) => ({
  ...props.theme.typography.headline_l,
  color: props.theme.colors.white_0,
  fontSize: 24,
  marginBottom: props.theme.spacing(8),
}));

const NftOwnedByText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

const OwnerAddressText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  marginLeft: props.theme.spacing(3),
}));

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const RowContainer = styled.div<{
  withGap?: boolean;
}>((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(12),
  flexDirection: 'row',
  columnGap: props.withGap ? props.theme.spacing(20) : 0,
}));

const ColumnContainer = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  width: '100%',
});

const OrdinalDetailsContainer = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  width: props.isGallery ? 400 : '100%',
  marginTop: props.theme.spacing(8),
}));

const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'row',
});

const MintLimitContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(30),
}));

const DescriptionContainer = styled.h1((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: props.theme.spacing(30),
}));

const StyledWebGalleryButton = styled(WebGalleryButton)`
  margintop: ${(props) => props.theme.space.s};
`;

const ViewInExplorerButton = styled.button<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  width: props.isGallery ? 392 : 328,
  height: 44,
  padding: 12,
  borderRadius: 12,
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(18),
  border: `1px solid ${props.theme.colors.white_800}`,
}));

const ButtonText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

const ButtonHiglightedText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
}));

const StyledTooltip = styled(Tooltip)`
  &&& {
    font-size: 12px;
    background-color: #ffffff;
    color: #12151e;
    border-radius: 8px;
    padding: 7px;
  }
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

const AssetDeatilButtonText = styled.div((props) => ({
  ...props.theme.typography.body_s,
  fontWeight: 400,
  fontSize: 14,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const ButtonIcon = styled.img({
  width: 12,
  height: 12,
});

const OrdinalsTag = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 2,
  background: 'rgba(39, 42, 68, 0.6)',
  borderRadius: 40,
  height: 22,
  padding: '3px 6px',
});

const CollectibleText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
}));

const GalleryCollectibleText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  color: props.theme.colors.white_400,
}));

const Text = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  textTransform: 'uppercase',
  color: props.theme.colors.white_0,
  fontSize: 10,
  marginLeft: props.theme.spacing(2),
}));

const RareSatsBundleContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  padding: props.theme.spacing(8),
  marginBottom: props.theme.spacing(8),
  border: `1px solid ${props.theme.colors.white_800}`,
  borderRadius: '12px',
}));
const CubeTransparentIcon = styled(CubeTransparent)((props) => ({
  color: props.theme.colors.white_200,
  marginRight: props.theme.spacing(8),
}));
const RareSatsBundleTextDescription = styled.div((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
}));
const BundleLinkContainer = styled.button((props) => ({
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  backgroundColor: 'transparent',
  color: props.theme.colors.white_0,
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
  ':hover': {
    color: props.theme.colors.white_200,
  },
}));
const BundleLinkText = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  marginRight: props.theme.spacing(1),
}));

const GalleryButtonContainer = styled.div`
  width: 190px;
  border-radius: 12px;
`;

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  columnGap: props.theme.spacing(11),
  paddingBottom: props.theme.spacing(16),
  marginBottom: props.theme.spacing(4),
  marginTop: props.theme.spacing(4),
  width: '100%',
  borderBottom: `1px solid ${props.theme.colors.elevation3}`,
}));

const DetailSection = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: !props.isGallery ? 'row' : 'column',
  justifyContent: 'space-between',
  width: '100%',
}));

const ExtensionLoaderContainer = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
});

const GalleryLoaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const StyledBarLoader = styled(BetterBarLoader)<{
  withMarginBottom?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginBottom: props.withMarginBottom ? props.theme.spacing(6) : 0,
}));

const StyledSeparator = styled(Separator)`
  width: 100%;
`;

const TitleLoader = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActionButtonsLoader = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  columnGap: props.theme.spacing(11),
}));

const ActionButtonLoader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: props.theme.spacing(4),
}));

const InfoContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: `0 ${props.theme.spacing(8)}px`,
}));

function OrdinalDetailScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });
  const ordinalDetails = useOrdinalDetail();
  const {
    ordinal,
    collectionMarketData,
    isLoading,
    ordinalsAddress,
    showSendOridnalsAlert,
    isBrc20Ordinal,
    isPartOfABundle,
    isGalleryOpen,
    brc20InscriptionStatus,
    brc20InscriptionStatusColor,
    textContent,
    handleSendOrdinal,
    onCloseAlert,
    handleBackButtonClick,
    openInGalleryView,
    handleRedirectToTx,
    openInOrdinalsExplorer,
    handleNavigationToRareSatsBundle,
    onCopyClick,
    backButtonText,
  } = ordinalDetails;

  useResetUserFlow('/ordinal-detail');

  const ownedByView = (
    <RowContainer>
      <NftOwnedByText>{t('OWNED_BY')}</NftOwnedByText>
      <OwnerAddressText>
        {`${ordinalsAddress.substring(0, 4)}...${ordinalsAddress.substring(
          ordinalsAddress.length - 4,
          ordinalsAddress.length,
        )}`}
      </OwnerAddressText>
      <OrdinalsTag>
        <ButtonIcon src={OrdinalsIcon} />
        <Text>{t('ORDINALS')}</Text>
      </OrdinalsTag>
    </RowContainer>
  );

  const ordinalDetailAttributes = (
    <OrdinalDetailsContainer isGallery={isGalleryOpen}>
      {!isGalleryOpen && ordinal?.collection_id && (
        <DetailSection isGallery={isGalleryOpen}>
          <CollectibleDetailTile title={t('COLLECTION')} value={ordinal?.collection_name ?? ''} />
          <CollectibleDetailTile
            title={t('COLLECTION_FLOOR_PRICE')}
            value={collectionMarketData?.floor_price?.toFixed(8) ?? '--'}
            suffixValue="BTC"
          />
        </DetailSection>
      )}
      {!isGalleryOpen && ordinal?.collection_id && (
        <CollectibleDetailTile
          title={t('EST_ITEM_VALUE')}
          value={
            ordinal?.inscription_floor_price || ordinal?.inscription_floor_price !== 0
              ? ordinal?.inscription_floor_price?.toString() ?? ''
              : '--'
          }
          allowThousandSeperator={
            !!(ordinal?.inscription_floor_price || ordinal?.inscription_floor_price !== 0)
          }
          suffixValue="BTC"
        />
      )}

      <CollectibleDetailTile title={t('ID')} value={ordinal?.id!} />
      {!isGalleryOpen && <CollectibleDetailTile title={t('ADDRESS')} value={ordinal?.address!} />}
      <DetailSection isGallery={isGalleryOpen}>
        {ordinal?.value && (
          <CollectibleDetailTile
            title={t('OUTPUT_VALUE')}
            value={ordinal?.value.toString()}
            allowThousandSeperator
            suffixValue="Sats"
          />
        )}
        {ordinal?.sat_ordinal && (
          <CollectibleDetailTile title={t('SAT')} value={ordinal?.sat_ordinal.toString()} />
        )}
      </DetailSection>
      <DetailSection isGallery={isGalleryOpen}>
        {ordinal?.content_length && (
          <CollectibleDetailTile
            title={t('CONTENT_LENGTH')}
            value={ordinal?.content_length.toString()}
            allowThousandSeperator
          />
        )}
        {ordinal?.content_type && (
          <CollectibleDetailTile title={t('CONTENT_TYPE')} value={ordinal?.content_type} />
        )}
      </DetailSection>
      <DetailSection isGallery={isGalleryOpen}>
        {ordinal?.genesis_block_height && (
          <CollectibleDetailTile
            title={t('GENESIS_HEIGHT')}
            value={ordinal?.genesis_block_height.toString()}
            allowThousandSeperator
          />
        )}
        {ordinal?.genesis_fee && (
          <CollectibleDetailTile title={t('GENESIS_FEE')} value={ordinal?.genesis_fee.toString()} />
        )}
      </DetailSection>
      <CollectibleDetailTile title={t('NFT_TYPE')} value={t('ORDINALS')} />
    </OrdinalDetailsContainer>
  );

  const showBrc20OrdinalDetail = (isGallery: boolean) => {
    try {
      const regex = /”/g;
      const validBrcContentValue = (textContent ?? '').replace(regex, '"');
      const content = JSON.parse(validBrcContentValue);

      switch (content.op) {
        case 'mint':
          return (
            <ColumnContainer>
              <OrdinalAttributeComponent title={t('AMOUNT_TO_MINT')} value={content.amt} />
              {!isGallery && (
                <OrdinalAttributeComponent
                  title={t('OWNED_BY')}
                  value={`${ordinalsAddress.substring(0, 4)}...${ordinalsAddress.substring(
                    ordinalsAddress.length - 4,
                    ordinalsAddress.length,
                  )}`}
                  showOridnalTag
                  isAddress
                />
              )}
            </ColumnContainer>
          );
        case 'transfer':
          return (
            <ColumnContainer>
              <DetailSection isGallery={isGalleryOpen}>
                <OrdinalAttributeComponent title={t('AMOUNT_TO_TRANSFER')} value={content.amt} />
                <OrdinalAttributeComponent
                  title={t('BRC20_TRANSFER_STATUS')}
                  value={brc20InscriptionStatus}
                  valueColor={brc20InscriptionStatusColor}
                  isAddress
                />
              </DetailSection>
              {!isGallery && (
                <OrdinalAttributeComponent
                  title={t('OWNED_BY')}
                  value={`${ordinalsAddress.substring(0, 4)}...${ordinalsAddress.substring(
                    ordinalsAddress.length - 4,
                    ordinalsAddress.length,
                  )}`}
                  showOridnalTag
                  isAddress
                />
              )}
            </ColumnContainer>
          );
        case 'deploy':
          return (
            <ColumnContainer>
              <Row>
                <OrdinalAttributeComponent title={t('TOTAL_SUPPLY')} value={content.max} />
                <MintLimitContainer>
                  <OrdinalAttributeComponent title={t('MINT_LIMIT')} value={content.lim} />
                </MintLimitContainer>
              </Row>
              {!isGallery && (
                <OrdinalAttributeComponent
                  title={t('OWNED_BY')}
                  value={`${ordinalsAddress.substring(0, 4)}...${ordinalsAddress.substring(
                    ordinalsAddress.length - 4,
                    ordinalsAddress.length,
                  )}`}
                  showOridnalTag
                  isAddress
                />
              )}
            </ColumnContainer>
          );
        default:
          return null;
      }
    } catch (error) {
      return isGallery ? ordinalDetailAttributes : ownedByView;
    }
  };

  const rareSats = isPartOfABundle && (
    <RareSatsBundleContainer>
      <CubeTransparentIcon size={24} />
      <div>
        <RareSatsBundleTextDescription>
          {t('RARE_SATS_BUNDLE_DESCRIPTION')}
        </RareSatsBundleTextDescription>
        <BundleLinkContainer onClick={handleNavigationToRareSatsBundle}>
          <BundleLinkText>{t('RARE_SATS_BUNDLE_LINK')}</BundleLinkText>
          <ArrowRight size={12} weight="bold" />
        </BundleLinkContainer>
      </div>
    </RareSatsBundleContainer>
  );

  const extensionView = isLoading ? (
    <ExtensionLoaderContainer>
      <TitleLoader>
        <StyledBarLoader width={100} height={18.5} withMarginBottom />
        <StyledBarLoader width={100} height={30} />
      </TitleLoader>
      <StyledBarLoader width={100} height={18.5} />
      <StyledBarLoader width={136} height={136} />
      <ActionButtonsLoader>
        <ActionButtonLoader>
          <StyledBarLoader width={48} height={48} />
          <StyledBarLoader width={30} height={15.5} />
        </ActionButtonLoader>
        <ActionButtonLoader>
          <StyledBarLoader width={48} height={48} />
          <StyledBarLoader width={30} height={15.5} />
        </ActionButtonLoader>
      </ActionButtonsLoader>
      <StyledSeparator />
      <InfoContainer>
        <div>
          <StyledBarLoader width={100} height={18.5} />
          <StyledBarLoader width={80} height={18.5} />
        </div>
        <div>
          <StyledBarLoader width={100} height={18.5} />
          <StyledBarLoader width={80} height={18.5} />
        </div>
      </InfoContainer>
    </ExtensionLoaderContainer>
  ) : (
    <ExtensionContainer>
      <CollectibleText>
        {isBrc20Ordinal ? t('BRC20_INSCRIPTION') : ordinal?.collection_name || t('INSCRIPTION')}
      </CollectibleText>
      <OrdinalTitleText>{ordinal?.number}</OrdinalTitleText>
      <StyledWebGalleryButton onClick={openInGalleryView} />
      <ExtensionOrdinalsContainer>
        <OrdinalImage ordinal={ordinal!} />
      </ExtensionOrdinalsContainer>
      <RowButtonContainer>
        <SquareButton
          icon={<ArrowUp weight="regular" size="20" />}
          text={t('SEND')}
          onPress={handleSendOrdinal}
        />
        <SquareButton
          icon={<Share weight="regular" color="white" size="20" />}
          text={t('SHARE')}
          onPress={onCopyClick}
          hoverDialogId={`copy-url-${ordinal?.id}`}
          isTransparent
        />
        <StyledTooltip
          anchorId={`copy-url-${ordinal?.id}`}
          variant="light"
          content={t('COPIED')}
          events={['click']}
          place="top"
        />
      </RowButtonContainer>
      {rareSats}
      {isBrc20Ordinal ? showBrc20OrdinalDetail(false) : ordinalDetailAttributes}
      <ViewInExplorerButton isGallery={isGalleryOpen} onClick={openInOrdinalsExplorer}>
        <ButtonText>{t('VIEW_IN')}</ButtonText>
        <ButtonHiglightedText>{t('ORDINAL_VIEWER')}</ButtonHiglightedText>
      </ViewInExplorerButton>
    </ExtensionContainer>
  );

  const galleryView = isLoading ? (
    <GalleryScrollContainer>
      <GalleryContainer>
        <BackButtonContainer>
          <Button onClick={handleBackButtonClick}>
            <>
              <ButtonImage src={ArrowLeft} />
              <AssetDeatilButtonText>{backButtonText}</AssetDeatilButtonText>
            </>
          </Button>
        </BackButtonContainer>

        <RowContainer withGap>
          <StyledBarLoader width={376.5} height={376.5} />
          <GalleryLoaderContainer>
            <StyledBarLoader width={120} height={21} withMarginBottom />
            <StyledBarLoader width={180} height={40} withMarginBottom />
            <StyledBarLoader width={100} height={18.5} withMarginBottom />
            <ButtonContainer>
              <StyledBarLoader width={190} height={44} />
              <StyledBarLoader width={190} height={44} />
            </ButtonContainer>
            <StyledBarLoader width={100} height={31} withMarginBottom />
            <StyledBarLoader width={400} height={18.5} withMarginBottom />
            <StyledBarLoader width={400} height={18.5} withMarginBottom />
            <StyledBarLoader width={400} height={18.5} withMarginBottom />
            <StyledBarLoader width={400} height={18.5} withMarginBottom />
            <StyledBarLoader width={400} height={18.5} withMarginBottom />
            <StyledBarLoader width={400} height={18.5} withMarginBottom />
            <StyledBarLoader width={392} height={44} />
          </GalleryLoaderContainer>
        </RowContainer>
      </GalleryContainer>
    </GalleryScrollContainer>
  ) : (
    <GalleryScrollContainer>
      <GalleryContainer>
        <BackButtonContainer>
          <Button onClick={handleBackButtonClick}>
            <>
              <ButtonImage src={ArrowLeft} />
              <AssetDeatilButtonText>{backButtonText}</AssetDeatilButtonText>
            </>
          </Button>
        </BackButtonContainer>

        <RowContainer withGap>
          <OrdinalsContainer>
            <OrdinalImage ordinal={ordinal!} inNftDetail />
          </OrdinalsContainer>
          <DescriptionContainer>
            <GalleryCollectibleText>
              {isBrc20Ordinal
                ? t('BRC20_INSCRIPTION')
                : ordinal?.collection_name || t('INSCRIPTION')}
            </GalleryCollectibleText>
            <OrdinalGalleryTitleText>{ordinal?.number}</OrdinalGalleryTitleText>
            <RowContainer>
              <ButtonText>{t('OWNED_BY')}</ButtonText>
              <ButtonHiglightedText>{`${ordinalsAddress.substring(
                0,
                4,
              )}...${ordinalsAddress.substring(
                ordinalsAddress.length - 4,
                ordinalsAddress.length,
              )}`}</ButtonHiglightedText>
            </RowContainer>

            <ButtonContainer>
              <GalleryButtonContainer>
                <ActionButton
                  icon={<ArrowUp weight="bold" size="16" />}
                  text={t('SEND')}
                  onPress={handleSendOrdinal}
                />
              </GalleryButtonContainer>
              <GalleryButtonContainer>
                <ActionButton
                  icon={<Share weight="bold" color="white" size="16" />}
                  text={t('SHARE')}
                  onPress={onCopyClick}
                  hoverDialogId={`copy-url-${ordinal?.id}`}
                  transparent
                />
                <StyledTooltip
                  anchorId={`copy-url-${ordinal?.id}`}
                  content={t('COPIED')}
                  events={['click']}
                  place="top"
                  variant="light"
                />
              </GalleryButtonContainer>
            </ButtonContainer>
            <DescriptionText>{t('DATA')}</DescriptionText>
            {rareSats}
            {isBrc20Ordinal ? showBrc20OrdinalDetail(true) : ordinalDetailAttributes}
            <ViewInExplorerButton isGallery={isGalleryOpen} onClick={openInOrdinalsExplorer}>
              <ButtonText>{t('VIEW_IN')}</ButtonText>
              <ButtonHiglightedText>{t('ORDINAL_VIEWER')}</ButtonHiglightedText>
            </ViewInExplorerButton>
          </DescriptionContainer>
        </RowContainer>
      </GalleryContainer>
    </GalleryScrollContainer>
  );

  const displayContent = isGalleryOpen && ordinal !== null ? galleryView : extensionView;

  return (
    <>
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      ) : (
        <TopRow title="" onClick={handleBackButtonClick} />
      )}
      {showSendOridnalsAlert && (
        <AlertMessage
          title={t('ORDINAL_PENDING_SEND_TITLE')}
          onClose={onCloseAlert}
          buttonText={t('ORDINAL_PENDING_SEND_BUTTON')}
          onButtonClick={handleRedirectToTx}
          description={t('ORDINAL_PENDING_SEND_DESCRIPTION')}
        />
      )}
      {displayContent}
      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
    </>
  );
}

export default OrdinalDetailScreen;
