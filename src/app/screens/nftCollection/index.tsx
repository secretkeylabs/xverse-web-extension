import AccountHeaderComponent from '@components/accountHeader';
import CollectibleCollectionGridItem from '@components/collectibleCollectionGridItem';
import CollectibleDetailTile from '@components/collectibleDetailTile';
import BottomTabBar from '@components/tabBar';
import { StyledBarLoader, TilesSkeletonLoader } from '@components/tilesSkeletonLoader';
import TopRow from '@components/topRow';
import WebGalleryButton from '@components/webGalleryButton';
import WrenchErrorMessage from '@components/wrenchErrorMessage';
import useNftDetail from '@hooks/queries/useNftDetail';
import { ArrowLeft } from '@phosphor-icons/react';
import { GridContainer } from '@screens/nftDashboard/collectiblesTabs';
import Nft from '@screens/nftDashboard/nft';
import NftImage from '@screens/nftDashboard/nftImage';
import { NonFungibleToken, StacksCollectionData } from '@secretkeylabs/xverse-core';
import { EMPTY_LABEL } from '@utils/constants';
import { getFullyQualifiedKey, getNftCollectionsGridItemId, isBnsCollection } from '@utils/nfts';
import { PropsWithChildren, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useIsVisible } from 'react-is-visible';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useNftCollection from './useNftCollection';

interface Props {
  isGalleryOpen?: boolean;
}
const Container = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const NoCollectiblesText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(16),
  marginBottom: 'auto',
  textAlign: 'center',
}));

const HeadingText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_400,
}));

const CollectionText = styled.p((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.spacing(1),
  marginBottom: props.theme.spacing(4),
  wordBreak: 'break-word',
}));

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const PageHeader = styled.div<Props>`
  padding: ${(props) => props.theme.space.xs};
  padding-top: 0;
  max-width: 1224px;
  margin-top: ${(props) => (props.isGalleryOpen ? props.theme.space.xxl : props.theme.space.l)};
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

const PageHeaderContent = styled.div<Props>`
  display: flex;
  flex-direction: ${(props) => (props.isGalleryOpen ? 'row' : 'column')};
  justify-content: ${(props) => (props.isGalleryOpen ? 'space-between' : 'initial')};
  row-gap: ${(props) => props.theme.space.xl};
`;

const NftContainer = styled.div<Props>`
  display: flex;
  flex-direction: ${(props) => (props.isGalleryOpen ? 'column' : 'row')};
  justify-content: ${(props) => (props.isGalleryOpen ? 'space-between' : 'initial')};
  column-gap: ${(props) => props.theme.space.m};
`;

const BackButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  width: 800,
  marginTop: props.theme.spacing(40),
}));

const BackButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: 'transparent',
  marginBottom: props.theme.spacing(12),
}));

const AssetDeatilButtonText = styled.div((props) => ({
  ...props.theme.typography.body_m,
  fontWeight: 400,
  fontSize: 14,
  marginLeft: 2,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

const StyledGridContainer = styled(GridContainer)`
  margin-top: ${(props) => props.theme.space.s};
  padding: 0 ${(props) => props.theme.space.xs};
  padding-bottom: ${(props) => props.theme.space.xl};
  max-width: 1224px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

/*
 * component to virtualise the grid item if not in window
 * placeholder is required to match grid item size, in order to negate scroll jank
 */
function IsVisibleOrPlaceholder({ children }: PropsWithChildren) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(nodeRef, { once: false });

  return (
    <div ref={nodeRef}>
      {isVisible ? (
        children
      ) : (
        <CollectibleCollectionGridItem>
          <NftImage />
        </CollectibleCollectionGridItem>
      )}
    </div>
  );
}

/*
 * component to load nft detail which contains image url
 */
function CollectionGridItemWithData({
  nft,
  collectionData,
  isGalleryOpen,
}: {
  nft: NonFungibleToken;
  collectionData: StacksCollectionData;
  isGalleryOpen: boolean;
}) {
  const { data: nftData } = useNftDetail(nft.identifier);
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'COLLECTIBLE_COLLECTION_SCREEN' });

  const handleClickItem = isBnsCollection(collectionData.collection_id)
    ? undefined
    : () => {
        if (nftData?.data?.token_metadata) {
          navigate(`/nft-dashboard/nft-detail/${getFullyQualifiedKey(nft.identifier)}`);
        } else {
          toast.error(t('ERRORS.FAILED_TO_FETCH'));
        }
      };

  return (
    <CollectibleCollectionGridItem
      item={nft}
      itemId={getNftCollectionsGridItemId(nft, collectionData)}
      onClick={handleClickItem}
    >
      <Nft asset={nft} isGalleryOpen={isGalleryOpen} />
    </CollectibleCollectionGridItem>
  );
}

function NftCollection() {
  const { t } = useTranslation('translation', { keyPrefix: 'COLLECTIBLE_COLLECTION_SCREEN' });
  const {
    collectionData,
    portfolioValue,
    isLoading,
    isError,
    isEmpty,
    isGalleryOpen,
    handleBackButtonClick,
    openInGalleryView,
  } = useNftCollection();

  return (
    <>
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      ) : (
        <TopRow onClick={handleBackButtonClick} />
      )}
      <Container>
        <PageHeader isGalleryOpen={isGalleryOpen}>
          {isGalleryOpen && (
            <BackButtonContainer>
              <BackButton onClick={handleBackButtonClick}>
                <>
                  <ArrowLeft weight="regular" size="20" color="white" />
                  <AssetDeatilButtonText>{t('BACK_TO_GALLERY')}</AssetDeatilButtonText>
                </>
              </BackButton>
            </BackButtonContainer>
          )}
          <PageHeaderContent isGalleryOpen={isGalleryOpen}>
            <div>
              <HeadingText>{t('COLLECTION')}</HeadingText>
              <CollectionText>
                {collectionData?.collection_name || <StyledBarLoader width={200} height={28} />}
              </CollectionText>
              {!isGalleryOpen && <WebGalleryButton onClick={openInGalleryView} />}
            </div>
            <NftContainer isGalleryOpen={isGalleryOpen}>
              <CollectibleDetailTile
                title={t('COLLECTION_FLOOR_PRICE')}
                value={
                  collectionData?.floor_price
                    ? `${collectionData?.floor_price?.toString()} STX`
                    : EMPTY_LABEL
                }
                isColumnAlignment={isGalleryOpen}
                isLoading={isLoading}
              />
              <CollectibleDetailTile
                title={t('EST_PORTFOLIO_VALUE')}
                value={portfolioValue ? `${portfolioValue?.toString()} STX` : EMPTY_LABEL}
                isColumnAlignment={isGalleryOpen}
                isLoading={isLoading}
              />
            </NftContainer>
          </PageHeaderContent>
        </PageHeader>
        <>
          {isEmpty && <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>}
          {!!isError && <WrenchErrorMessage />}
          <StyledGridContainer isGalleryOpen={isGalleryOpen}>
            {isLoading ? (
              <TilesSkeletonLoader
                isGalleryOpen={isGalleryOpen}
                tileSize={isGalleryOpen ? 276 : 151}
              />
            ) : (
              collectionData?.all_nfts
                .sort((a, b) => (a.value.repr > b.value.repr ? 1 : -1))
                .map((nft) => (
                  <IsVisibleOrPlaceholder key={getFullyQualifiedKey(nft.identifier)}>
                    <CollectionGridItemWithData
                      nft={nft}
                      collectionData={collectionData}
                      isGalleryOpen={isGalleryOpen}
                    />
                  </IsVisibleOrPlaceholder>
                ))
            )}
          </StyledGridContainer>
        </>
      </Container>
      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
    </>
  );
}

export default NftCollection;
