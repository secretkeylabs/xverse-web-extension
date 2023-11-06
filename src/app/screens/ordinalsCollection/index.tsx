import AccountHeaderComponent from '@components/accountHeader';
import { BetterBarLoader } from '@components/barLoader';
import ActionButton from '@components/button';
import CollectibleCollectionGridItem from '@components/collectibleCollectionGridItem';
import CollectibleDetailTile from '@components/collectibleDetailTile';
import Separator from '@components/separator';
import BottomTabBar from '@components/tabBar';
import { TilesSkeletonLoader } from '@components/tilesSkeletonLoader';
import TopRow from '@components/topRow';
import WebGalleryButton from '@components/webGalleryButton';
import WrenchErrorMessage from '@components/wrenchErrorMessage';
import useAddressInscriptions from '@hooks/queries/ordinals/useAddressInscriptions';
import useInscriptionCollectionMarketData from '@hooks/queries/ordinals/useCollectionMarketData';
import useOrdinalDataReducer from '@hooks/stores/useOrdinalReducer';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import { ArrowLeft } from '@phosphor-icons/react';
import { GridContainer } from '@screens/nftDashboard/collectiblesTabs';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { Inscription } from '@secretkeylabs/xverse-core';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import {
  getInscriptionsCollectionGridItemId,
  getInscriptionsCollectionGridItemSubText,
  getInscriptionsCollectionGridItemSubTextColor,
} from '@utils/inscriptions';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

interface DetailSectionProps {
  isGalleryOpen?: boolean;
}

/* layout */
// TODO tim: create a reusable layout
const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  ${(props) => props.theme.scrollbar}
`;

const PageHeader = styled.div<DetailSectionProps>`
  padding: ${(props) => props.theme.space.xs};
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

const AttributesContainer = styled.div<DetailSectionProps>`
  display: flex;
  flex-direction: ${(props) => (props.isGalleryOpen ? 'column' : 'row')};
  justify-content: ${(props) => (props.isGalleryOpen ? 'space-between' : 'initial')};
  column-gap: ${(props) => props.theme.space.m};
`;

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const StyledSeparator = styled(Separator)`
  margin-bottom: ${(props) => props.theme.space.xxl};
`;

const StyledGridContainer = styled(GridContainer)`
  margin-top: ${(props) => props.theme.space.s};
  padding: 0 ${(props) => props.theme.space.xs};
  padding-bottom: ${(props) => props.theme.space.xl};
  max-width: 1224px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

/* components */

const StyledWebGalleryButton = styled(WebGalleryButton)`
  margin-top: ${(props) => props.theme.space.xs};
`;

const StyledWrenchErrorMessage = styled(WrenchErrorMessage)`
  margin-top: ${(props) => props.theme.space.xxl};
`;

const BackButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: ${(props) => props.theme.space.xxl};
`;

const BackButton = styled.button((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: props.theme.space.xxs,
  background: 'transparent',
  marginBottom: props.theme.spacing(12),
  color: props.theme.colors.white_0,
}));

const NoCollectiblesText = styled.p((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(16),
  marginBottom: 'auto',
  textAlign: 'center',
}));

const LoadMoreButtonContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: props.theme.spacing(30),
  marginTop: props.theme.space.xl,
  button: {
    width: 156,
  },
}));

const StyledBarLoader = styled(BetterBarLoader)((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginTop: props.theme.spacing(2),
}));

function OrdinalsCollection() {
  const { t } = useTranslation('translation', { keyPrefix: 'COLLECTIBLE_COLLECTION_SCREEN' });
  const navigate = useNavigate();
  const { setSelectedOrdinalDetails } = useOrdinalDataReducer();
  const { id: collectionId } = useParams();
  const { data, error, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAddressInscriptions(collectionId);
  const { data: collectionMarketData, isLoading: isLoadingMarketData } =
    useInscriptionCollectionMarketData(collectionId);

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  useResetUserFlow('/ordinals-collection');

  const handleBackButtonClick = () => {
    navigate('/nft-dashboard?tab=inscriptions');
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`options.html#/nft-dashboard/ordinals-collection/${collectionId}`),
    });
  };

  const isEmpty = !isLoading && !error && data?.pages?.[0]?.total === 0;

  const collectionHeading = data?.pages?.[0].collection_name;
  const estPortfolioValue =
    data && data?.pages?.[0].portfolio_value !== 0
      ? `${data?.pages?.[0].portfolio_value.toFixed(8)} BTC`
      : '--';
  const collectionFloorPrice = collectionMarketData?.floor_price
    ? `${collectionMarketData?.floor_price?.toFixed(8)} BTC`
    : '--';

  const handleOnClick = (item: Inscription) => {
    setSelectedOrdinalDetails(item);
    navigate(`/nft-dashboard/ordinal-detail/${item.id}`);
  };

  return (
    <>
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      ) : (
        <TopRow title="" onClick={handleBackButtonClick} />
      )}
      <Container>
        <PageHeader isGalleryOpen={isGalleryOpen}>
          {isGalleryOpen && (
            <BackButtonContainer>
              <BackButton onClick={handleBackButtonClick}>
                <ArrowLeft size={16} color="currentColor" />
                <StyledP typography="body_m" color="white_0">
                  {t('BACK_TO_GALLERY')}
                </StyledP>
              </BackButton>
            </BackButtonContainer>
          )}
          <PageHeaderContent isGalleryOpen={isGalleryOpen}>
            <div>
              <StyledP typography="body_bold_m" color="white_400">
                {t('COLLECTION')}
              </StyledP>
              <StyledHeading typography="headline_s" color="white_0">
                {collectionHeading || <StyledBarLoader width={200} height={28} />}
              </StyledHeading>
              {!isGalleryOpen && <StyledWebGalleryButton onClick={openInGalleryView} />}
            </div>
            <AttributesContainer isGalleryOpen={isGalleryOpen}>
              <CollectibleDetailTile
                title={t('COLLECTION_FLOOR_PRICE')}
                value={collectionFloorPrice}
                isColumnAlignment={isGalleryOpen}
                isLoading={isLoadingMarketData}
              />
              <CollectibleDetailTile
                title={t('EST_PORTFOLIO_VALUE')}
                value={estPortfolioValue}
                isColumnAlignment={isGalleryOpen}
                isLoading={isLoading}
              />
            </AttributesContainer>
          </PageHeaderContent>
        </PageHeader>
        {isGalleryOpen && <StyledSeparator />}
        <div>
          {isEmpty && <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>}
          {!!error && <StyledWrenchErrorMessage />}
          <StyledGridContainer isGalleryOpen={isGalleryOpen}>
            {isLoading ? (
              <TilesSkeletonLoader
                isGalleryOpen={isGalleryOpen}
                tileSize={isGalleryOpen ? 276 : 151}
              />
            ) : (
              data?.pages
                ?.map((page) => page?.data)
                .flat()
                .map((inscription) => (
                  <CollectibleCollectionGridItem
                    key={inscription?.id}
                    item={inscription}
                    itemId={getInscriptionsCollectionGridItemId(inscription)}
                    itemSubText={getInscriptionsCollectionGridItemSubText(inscription)}
                    itemSubTextColor={getInscriptionsCollectionGridItemSubTextColor(inscription)}
                    onClick={handleOnClick}
                  >
                    <OrdinalImage ordinal={inscription} />
                  </CollectibleCollectionGridItem>
                ))
            )}
          </StyledGridContainer>
          {hasNextPage && (
            <LoadMoreButtonContainer>
              <ActionButton
                transparent
                text={t('LOAD_MORE')}
                processing={isFetchingNextPage}
                disabled={isFetchingNextPage}
                onPress={fetchNextPage}
              />
            </LoadMoreButtonContainer>
          )}
        </div>
      </Container>
      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
    </>
  );
}

export default OrdinalsCollection;
