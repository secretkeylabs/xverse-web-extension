import CollectibleCollectionGridItem from '@components/collectibleCollectionGridItem';
import CollectibleDetailTile from '@components/collectibleDetailTile';
import BottomTabBar from '@components/tabBar';
import { TilesSkeletonLoader } from '@components/tilesSkeletonLoader';
import TopRow from '@components/topRow';
import useAddressCollectionInscriptions from '@hooks/queries/ordinals/useAddressCollectionInscriptions';
import useInscriptionCollectionMarketData from '@hooks/queries/ordinals/useCollectionMarketData';
import useOptionsSheet from '@hooks/useOptionsSheet';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { TrayArrowDown, TrayArrowUp } from '@phosphor-icons/react';
import {
  CollectiblesContainer,
  GridContainer,
} from '@screens/nftDashboard/collectiblesTabs/index.styled';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import {
  addToHideCollectiblesAction,
  addToStarCollectiblesAction,
  removeAccountAvatarAction,
  removeFromHideCollectiblesAction,
  removeFromStarCollectiblesAction,
} from '@stores/wallet/actions/actionCreators';
import Button from '@ui-library/button';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import SnackBar from '@ui-library/snackBar';
import { EMPTY_LABEL, LONG_TOAST_DURATION, POPUP_WIDTH } from '@utils/constants';
import {
  getInscriptionsCollectionGridItemId,
  getInscriptionsCollectionGridItemSubText,
  getInscriptionsCollectionGridItemSubTextColor,
} from '@utils/inscriptions';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Theme from 'theme';
import {
  AttributesContainer,
  BottomBarContainer,
  CollectionNameDiv,
  Container,
  LoadMoreButtonContainer,
  NoCollectiblesText,
  PageHeader,
  PageHeaderContent,
  StyledBarLoader,
  StyledButton,
  StyledWebGalleryButton,
  StyledWrenchErrorMessage,
} from './index.styled';

function OrdinalsCollection() {
  const { t } = useTranslation('translation', { keyPrefix: 'COLLECTIBLE_COLLECTION_SCREEN' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ordinalsAddress } = useSelectedAccount();
  const optionsSheet = useOptionsSheet();
  const { id: collectionId, from } = useParams();
  const { starredCollectibleIds, hiddenCollectibleIds, avatarIds } = useWalletSelector();

  const { data, error, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAddressCollectionInscriptions(collectionId);
  const { data: collectionMarketData, isLoading: isLoadingMarketData } =
    useInscriptionCollectionMarketData(collectionId);

  const comesFromHidden = from === 'hidden';
  const selectedAvatar = avatarIds[ordinalsAddress];
  const isEmpty = !isLoading && !error && data?.pages?.[0]?.total === 0;
  const collectionHeading = data?.pages?.[0].collection_name;
  const estPortfolioValue =
    data && data?.pages?.[0].portfolio_value !== 0
      ? `${data?.pages?.[0].portfolio_value.toFixed(8)} BTC`
      : EMPTY_LABEL;
  const collectionFloorPrice = collectionMarketData?.floor_price
    ? `${collectionMarketData?.floor_price?.toFixed(8)} BTC`
    : EMPTY_LABEL;

  const isGalleryOpen: boolean = useMemo(
    () => document.documentElement.clientWidth > POPUP_WIDTH,
    [],
  );
  const collectionStarred: boolean = useMemo(
    () => starredCollectibleIds[ordinalsAddress]?.some(({ id }) => id === collectionId),
    [collectionId, ordinalsAddress, starredCollectibleIds],
  );
  const collectionHidden = useMemo(
    () =>
      Object.keys(hiddenCollectibleIds[ordinalsAddress] ?? {}).some((id) => id === collectionId),
    [collectionId, ordinalsAddress, hiddenCollectibleIds],
  );

  useResetUserFlow('/ordinals-collection');

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`options.html#/nft-dashboard/ordinals-collection/${collectionId}`),
    });
  };

  const handleClickUndoHiding = (toastId: string) => {
    dispatch(
      removeFromHideCollectiblesAction({ address: ordinalsAddress, id: collectionId ?? '' }),
    );
    toast.remove(toastId);
    toast(t('COLLECTION_UNHIDDEN'));
  };

  const handleHideCollection = () => {
    dispatch(addToHideCollectiblesAction({ address: ordinalsAddress, id: collectionId ?? '' }));
    if (selectedAvatar?.type === 'inscription') {
      const shouldHideAvatar = data?.pages
        ?.map((page) => page?.data)
        .flat()
        .some((inscription) => inscription && inscription.id === selectedAvatar.inscription.id);
      if (shouldHideAvatar) {
        dispatch(removeAccountAvatarAction({ address: ordinalsAddress }));
      }
    }

    optionsSheet.close();
    navigate('/nft-dashboard?tab=inscriptions');
    const toastId = toast(
      <SnackBar
        text={t('COLLECTION_HIDDEN')}
        type="neutral"
        action={{
          text: tCommon('UNDO'),
          onClick: () => handleClickUndoHiding(toastId),
        }}
      />,
      { duration: LONG_TOAST_DURATION },
    );
  };

  const handleUnHideCollection = () => {
    const isLastHiddenItem = Object.keys(hiddenCollectibleIds[ordinalsAddress] ?? {}).length === 1;
    dispatch(
      removeFromHideCollectiblesAction({ address: ordinalsAddress, id: collectionId ?? '' }),
    );
    optionsSheet.close();
    toast(t('COLLECTION_UNHIDDEN'));
    navigate(`/nft-dashboard/${isLastHiddenItem ? '' : 'hidden'}?tab=inscriptions`);
  };

  const handleClickUndoStarring = (toastId: string) => {
    dispatch(
      removeFromStarCollectiblesAction({ address: ordinalsAddress, id: collectionId ?? '' }),
    );
    toast.remove(toastId);
    toast(t('UNSTAR_COLLECTION'));
  };

  const handleStarClick = () => {
    if (collectionStarred) {
      dispatch(
        removeFromStarCollectiblesAction({ address: ordinalsAddress, id: collectionId ?? '' }),
      );
      toast(t('UNSTAR_COLLECTION'));
    } else {
      dispatch(addToStarCollectiblesAction({ address: ordinalsAddress, id: collectionId ?? '' }));
      const toastId = toast(
        <SnackBar
          text={t('STAR_COLLECTION')}
          type="neutral"
          action={{
            text: tCommon('UNDO'),
            onClick: () => handleClickUndoStarring(toastId),
          }}
        />,
        { duration: LONG_TOAST_DURATION },
      );
    }
  };

  return (
    <>
      <TopRow
        onClick={() =>
          navigate(
            `/nft-dashboard${
              comesFromHidden || collectionHidden ? '/hidden' : ''
            }?tab=inscriptions`,
          )
        }
        onMenuClick={optionsSheet.open}
        onStarClick={collectionHidden ? undefined : handleStarClick}
        isStarred={collectionStarred}
      />
      <Container>
        <PageHeader>
          <PageHeaderContent $isGalleryOpen={isGalleryOpen}>
            <div>
              <StyledP typography="body_bold_m" color="white_400">
                {t('COLLECTION')}
              </StyledP>
              <CollectionNameDiv>
                <StyledHeading typography="headline_s" color="white_0">
                  {collectionHeading || <StyledBarLoader width={200} height={28} />}
                </StyledHeading>
              </CollectionNameDiv>
              {!isGalleryOpen && <StyledWebGalleryButton onClick={openInGalleryView} />}
            </div>
            <AttributesContainer $isGalleryOpen={isGalleryOpen}>
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
        <CollectiblesContainer>
          {isEmpty && <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>}
          {!!error && <StyledWrenchErrorMessage />}
          <GridContainer $isGalleryOpen={isGalleryOpen}>
            {isLoading ? (
              <TilesSkeletonLoader
                isGalleryOpen={isGalleryOpen}
                tileSize={isGalleryOpen ? 171 : 151}
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
                    onClick={() => navigate(`/nft-dashboard/ordinal-detail/${inscription?.id}`)}
                  >
                    <OrdinalImage ordinal={inscription} />
                  </CollectibleCollectionGridItem>
                ))
            )}
          </GridContainer>
          {hasNextPage && (
            <LoadMoreButtonContainer>
              <Button
                variant="secondary"
                title={t('LOAD_MORE')}
                loading={isFetchingNextPage}
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              />
            </LoadMoreButtonContainer>
          )}
        </CollectiblesContainer>
      </Container>
      <BottomBarContainer>
        <BottomTabBar tab="nft" />
      </BottomBarContainer>
      {optionsSheet.isVisible && (
        <Sheet
          title={tCommon('OPTIONS')}
          visible={optionsSheet.isVisible}
          onClose={optionsSheet.close}
        >
          {collectionHidden ? (
            <StyledButton
              variant="tertiary"
              icon={<TrayArrowUp size={24} color={Theme.colors.white_200} />}
              title={t('UNHIDE_COLLECTION')}
              onClick={handleUnHideCollection}
            />
          ) : (
            <StyledButton
              variant="tertiary"
              icon={<TrayArrowDown size={24} color={Theme.colors.white_200} />}
              title={t('HIDE_COLLECTION')}
              onClick={handleHideCollection}
            />
          )}
        </Sheet>
      )}
    </>
  );
}

export default OrdinalsCollection;
