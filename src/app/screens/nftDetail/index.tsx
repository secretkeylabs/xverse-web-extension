import SquaresFour from '@assets/img/nftDashboard/squares_four.svg';
import AccountHeaderComponent from '@components/accountHeader';
import { BetterBarLoader } from '@components/barLoader';
import ActionButton from '@components/button';
import CollectibleDetailTile from '@components/collectibleDetailTile';
import Separator from '@components/separator';
import SquareButton from '@components/squareButton';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { ArrowLeft, ArrowUp, Share } from '@phosphor-icons/react';
import NftImage from '@screens/nftDashboard/nftImage';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';
import NftAttribute from './nftAttribute';
import useNftDetail from './useNftDetail';

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

const GalleryReceiveButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(3),
  width: '100%',
}));

const BackButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  width: 800,
  marginTop: props.theme.spacing(40),
}));

const ButtonContainer = styled.div((props) => ({
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

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const NFtContainer = styled.div((props) => ({
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

const ExtensionNFtContainer = styled.div((props) => ({
  maxHeight: 148,
  width: 148,
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginBottom: props.theme.spacing(12),
}));

const NftTitleText = styled.h1((props) => ({
  ...props.theme.headline_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const CollectibleText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
}));

const NftGalleryTitleText = styled.h1((props) => ({
  ...props.theme.headline_l,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

const NftOwnedByText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
}));

const OwnerAddressText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'center',
  marginLeft: props.theme.spacing(3),
}));

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const RowContainer = styled.h1({
  display: 'flex',
  flexDirection: 'row',
});

const GridContainer = styled.div((props) => ({
  display: 'grid',
  width: '100%',
  marginTop: props.theme.spacing(6),
  columnGap: props.theme.spacing(8),
  rowGap: props.theme.spacing(6),
  gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
  marginBottom: props.theme.spacing(8),
}));

const ShareButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(3),
  width: '100%',
}));

const DescriptionContainer = styled.h1((props) => ({
  display: 'flex',
  marginLeft: props.theme.spacing(20),
  flexDirection: 'column',
  marginBottom: props.theme.spacing(30),
}));

const AttributeText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

const WebGalleryButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(12),
}));

const WebGalleryButtonText = styled.div((props) => ({
  ...props.theme.body_m,
  fontWeight: 700,
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const BackButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: 'transparent',
  marginBottom: props.theme.spacing(12),
}));

const ExtensionLoaderContainer = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
});

const SeeDetailsButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(27),
  marginTop: props.theme.spacing(4),
}));

const Button = styled.button<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  width: props.isGallery ? 288 : 328,
  height: 44,
  padding: 12,
  borderRadius: 12,
  marginTop: props.theme.spacing(6),
  border: `1px solid ${props.theme.colors.white_800}`,
}));

const ButtonText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_400,
}));

const AssetDeatilButtonText = styled.div((props) => ({
  ...props.theme.typography.body_m,
  fontWeight: 400,
  fontSize: 14,
  marginLeft: 2,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const GalleryCollectibleText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  color: props.theme.colors.white_400,
}));

const GalleryScrollContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
}));

const ButtonHiglightedText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_0,
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
}));

const GalleryRowContainer = styled.div<{
  withGap?: boolean;
}>((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(12),
  flexDirection: 'row',
  columnGap: props.withGap ? props.theme.spacing(20) : 0,
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

const StyledBarLoader = styled(BetterBarLoader)<{
  withMarginBottom?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginBottom: props.withMarginBottom ? props.theme.spacing(6) : 0,
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

const ActionButtonLoader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: props.theme.spacing(4),
}));

const ActionButtonsLoader = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  columnGap: props.theme.spacing(11),
}));

const GalleryLoaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const StyledSeparator = styled(Separator)`
  width: 100%;
`;

const TitleLoader = styled.div`
  display: flex;
  flex-direction: column;
`;
interface DetailSectionProps {
  isGallery: boolean;
}

const NftDetailsContainer = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  width: props.isGallery ? 400 : '100%',
  marginTop: props.theme.spacing(8),
}));

const DetailSection = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: !props.isGallery ? 'row' : 'column',
  justifyContent: 'space-between',
  width: '100%',
}));

const InfoContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: `0 ${props.theme.spacing(8)}px`,
}));

function NftDetailScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });
  const {
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
  } = useNftDetail();

  const nftAttributes = nft?.nft_token_attributes.length !== 0 && (
    <>
      <AttributeText>{t('ATTRIBUTES')}</AttributeText>
      <GridContainer>
        {nft?.nft_token_attributes.map((attribute) => (
          <NftAttribute
            key={attribute.trait_type}
            type={attribute.trait_type}
            value={attribute.value}
          />
        ))}
      </GridContainer>
    </>
  );
  const nftDetails = (
    <NftDetailsContainer isGallery={isGalleryOpen}>
      {collectionInfo?.collection_name && (
        <DetailSection isGallery={isGalleryOpen}>
          <CollectibleDetailTile title={t('COLLECTION')} value={collectionInfo?.collection_name} />
          <CollectibleDetailTile
            title={t('COLLECTION_FLOOR_PRICE')}
            value={
              collectionInfo?.floor_price ? `${collectionInfo?.floor_price.toString()} STX` : '--'
            }
          />
        </DetailSection>
      )}
      {!isGalleryOpen && nftAttributes}
      <DetailSection isGallery={isGalleryOpen}>
        <CollectibleDetailTile title={t('NAME')} value={nft?.token_metadata?.name!} />
        {nft?.rarity_score && (
          <CollectibleDetailTile title={t('RARITY')} value={nft?.rarity_score} />
        )}
      </DetailSection>
      <CollectibleDetailTile
        title={t('CONTRACT_ID')}
        value={nft?.token_metadata?.contract_id ?? ''}
      />
    </NftDetailsContainer>
  );

  const extensionView =
    isLoading || !nft ? (
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
        <CollectibleText>{t('COLLECTIBLE')}</CollectibleText>
        <NftTitleText>{nft?.token_metadata.name}</NftTitleText>
        <WebGalleryButton onClick={openInGalleryView}>
          <>
            <ButtonImage src={SquaresFour} />
            <WebGalleryButtonText>{t('WEB_GALLERY')}</WebGalleryButtonText>
          </>
        </WebGalleryButton>
        <ExtensionNFtContainer>
          <NftImage metadata={nft?.token_metadata!} />
        </ExtensionNFtContainer>
        <ButtonContainer>
          <SquareButton
            icon={<ArrowUp weight="regular" size="20" />}
            text={t('SEND')}
            onPress={handleOnSendClick}
          />
          <SquareButton
            icon={<Share weight="regular" color="white" size="20" />}
            text={t('SHARE')}
            onPress={onSharePress}
            hoverDialogId={`copy-nft-url-${nft?.asset_id}`}
            isTransparent
          />
          <StyledTooltip
            anchorId={`copy-nft-url-${nft?.asset_id}`}
            variant="light"
            content={t('COPIED')}
            events={['click']}
            place="top"
          />
        </ButtonContainer>
        {nftDetails}
        <SeeDetailsButtonContainer>
          <Button isGallery={isGalleryOpen} onClick={onExplorerPress}>
            <ButtonText>{t('VIEW_CONTRACT')}</ButtonText>
            <ButtonHiglightedText>{t('STACKS_EXPLORER')}</ButtonHiglightedText>
          </Button>
          <Button isGallery={isGalleryOpen} onClick={onGammaPress}>
            <ButtonText>{t('DETAILS')}</ButtonText>
            <ButtonHiglightedText>{t('GAMMA')}</ButtonHiglightedText>
          </Button>
        </SeeDetailsButtonContainer>
      </ExtensionContainer>
    );

  const galleryView =
    isLoading || !nft ? (
      <GalleryScrollContainer>
        <GalleryContainer>
          <BackButtonContainer>
            <BackButton onClick={handleBackButtonClick}>
              <>
                <ArrowLeft weight="regular" size="20" color="white" />
                <AssetDeatilButtonText>{t('MOVE_TO_ASSET_DETAIL')}</AssetDeatilButtonText>
              </>
            </BackButton>
          </BackButtonContainer>

          <GalleryRowContainer withGap>
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
          </GalleryRowContainer>
        </GalleryContainer>
      </GalleryScrollContainer>
    ) : (
      <GalleryScrollContainer>
        <GalleryContainer>
          <BackButtonContainer>
            <BackButton onClick={handleBackButtonClick}>
              <ArrowLeft weight="regular" size="20" color="white" />
              <AssetDeatilButtonText>{t('MOVE_TO_ASSET_DETAIL')}</AssetDeatilButtonText>
            </BackButton>
          </BackButtonContainer>
          <GalleryRowContainer>
            <ColumnContainer>
              <NFtContainer>
                <NftImage metadata={nft?.token_metadata!} />
              </NFtContainer>
              {nftAttributes}
            </ColumnContainer>
            <DescriptionContainer>
              <GalleryCollectibleText>{t('COLLECTIBLE')}</GalleryCollectibleText>
              <NftGalleryTitleText>{nft?.token_metadata.name}</NftGalleryTitleText>
              <RowContainer>
                <NftOwnedByText>{t('OWNED_BY')}</NftOwnedByText>
                <OwnerAddressText>
                  {`${stxAddress.substring(0, 4)}...${stxAddress.substring(
                    stxAddress.length - 4,
                    stxAddress.length,
                  )}`}
                </OwnerAddressText>
              </RowContainer>
              <GalleryRowContainer>
                <GalleryReceiveButtonContainer>
                  <ActionButton
                    icon={<ArrowUp weight="bold" size="16" />}
                    text={t('SEND')}
                    onPress={handleOnSendClick}
                  />
                </GalleryReceiveButtonContainer>

                <ShareButtonContainer>
                  <ActionButton
                    icon={<Share weight="bold" color="white" size="16" />}
                    text={t('SHARE')}
                    onPress={onSharePress}
                    hoverDialogId={`copy-nft-url-${nft?.asset_id}`}
                    transparent
                  />
                  <StyledTooltip
                    anchorId={`copy-nft-url-${nft?.asset_id}`}
                    variant="light"
                    content={t('COPIED')}
                    events={['click']}
                    place="top"
                  />
                </ShareButtonContainer>
              </GalleryRowContainer>
              {nftDetails}
              <Button isGallery={isGalleryOpen} onClick={onExplorerPress}>
                <ButtonText>{t('VIEW_CONTRACT')}</ButtonText>
                <ButtonHiglightedText>{t('STACKS_EXPLORER')}</ButtonHiglightedText>
              </Button>
              <Button isGallery={isGalleryOpen} onClick={onGammaPress}>
                <ButtonText>{t('DETAILS')}</ButtonText>
                <ButtonHiglightedText>{t('GAMMA')}</ButtonHiglightedText>
              </Button>
            </DescriptionContainer>
          </GalleryRowContainer>
        </GalleryContainer>
      </GalleryScrollContainer>
    );

  return (
    <>
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      ) : (
        <TopRow title="" onClick={handleBackButtonClick} />
      )}
      {isGalleryOpen ? galleryView : extensionView}
      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
    </>
  );
}

export default NftDetailScreen;
