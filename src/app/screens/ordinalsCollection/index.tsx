import AccountHeaderComponent from '@components/accountHeader';
import CollectibleCollectionGridItem from '@components/collectibleCollectionGridItem';
import CollectibleDetailTile from '@components/collectibleDetailTile';
import SquareButton from '@components/squareButton';
import BottomTabBar from '@components/tabBar';
import { TilesSkeletonLoader } from '@components/tilesSkeletonLoader';
import TopRow from '@components/topRow';
import useAddressCollectionInscriptions from '@hooks/queries/ordinals/useAddressCollectionInscriptions';
import useInscriptionCollectionMarketData from '@hooks/queries/ordinals/useCollectionMarketData';
import useOptionsSheet from '@hooks/useOptionsSheet';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArchiveTray, ArrowLeft, DotsThreeVertical, Star } from '@phosphor-icons/react';
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
import { EMPTY_LABEL, LONG_TOAST_DURATION } from '@utils/constants';
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
  BackButton,
  BackButtonContainer,
  BottomBarContainer,
  CollectionNameDiv,
  Container,
  LoadMoreButtonContainer,
  NoCollectiblesText,
  PageHeader,
  PageHeaderContent,
  StyledBarLoader,
  StyledButton,
  StyledGridContainer,
  StyledSeparator,
  StyledWebGalleryButton,
  StyledWrenchErrorMessage,
} from './index.styled';

function OrdinalsCollection() {
  const { t } = useTranslation('translation', { keyPrefix: 'COLLECTIBLE_COLLECTION_SCREEN' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const navigate = useNavigate();
  const { ordinalsAddress } = useSelectedAccount();
  const { id: collectionId, from } = useParams();
  const { starredCollectibleIds, hiddenCollectibleIds, avatarIds } = useWalletSelector();
  const selectedAvatar = avatarIds[ordinalsAddress];
  const optionsSheet = useOptionsSheet();
  const { data, error, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAddressCollectionInscriptions(collectionId);
  const { data: collectionMarketData, isLoading: isLoadingMarketData } =
    useInscriptionCollectionMarketData(collectionId);
  const dispatch = useDispatch();
  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  const collectionStarred = starredCollectibleIds[ordinalsAddress]?.some(
    ({ id }) => id === collectionId,
  );
  const collectionHidden = Object.keys(hiddenCollectibleIds[ordinalsAddress] ?? {}).some(
    (id) => id === collectionId,
  );

  const comesFromHidden = from === 'hidden';

  useResetUserFlow('/ordinals-collection');

  const handleBackButtonClick = () =>
    navigate(
      `/nft-dashboard${comesFromHidden || collectionHidden ? '/hidden' : ''}?tab=inscriptions`,
    );

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
        .some((inscription) => inscription.id === selectedAvatar.inscription.id);

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

  const isEmpty = !isLoading && !error && data?.pages?.[0]?.total === 0;
  const collectionHeading = data?.pages?.[0].collection_name;
  const estPortfolioValue =
    data && data?.pages?.[0].portfolio_value !== 0
      ? `${data?.pages?.[0].portfolio_value.toFixed(8)} BTC`
      : EMPTY_LABEL;
  const collectionFloorPrice = collectionMarketData?.floor_price
    ? `${collectionMarketData?.floor_price?.toFixed(8)} BTC`
    : EMPTY_LABEL;

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
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      ) : (
        <TopRow
          onClick={handleBackButtonClick}
          onMenuClick={optionsSheet.open}
          onStarClick={collectionHidden ? undefined : handleStarClick}
          isStarred={collectionStarred}
        />
      )}
      <Container>
        <PageHeader $isGalleryOpen={isGalleryOpen}>
          {isGalleryOpen && (
            <BackButtonContainer>
              <BackButton onClick={handleBackButtonClick}>
                <ArrowLeft size={16} color="currentColor" />
                <StyledP data-testid="back-to-gallery" typography="body_m" color="white_0">
                  {t(collectionHidden ? 'BACK_TO_HIDDEN_COLLECTIBLES' : 'BACK_TO_GALLERY')}
                </StyledP>
              </BackButton>
            </BackButtonContainer>
          )}
          <PageHeaderContent $isGalleryOpen={isGalleryOpen}>
            <div>
              <StyledP typography="body_bold_m" color="white_400">
                {t('COLLECTION')}
              </StyledP>
              <CollectionNameDiv>
                <StyledHeading typography="headline_s" color="white_0">
                  {collectionHeading || <StyledBarLoader width={200} height={28} />}
                </StyledHeading>
                {isGalleryOpen && (
                  <>
                    {collectionHidden ? null : (
                      <SquareButton
                        icon={
                          collectionStarred ? (
                            <Star size={16} color={Theme.colors.tangerine} weight="fill" />
                          ) : (
                            <Star size={16} color={Theme.colors.white_0} weight="bold" />
                          )
                        }
                        onPress={handleStarClick}
                        isTransparent
                        size={44}
                        radiusSize={12}
                      />
                    )}
                    <SquareButton
                      icon={
                        <DotsThreeVertical size={20} color={Theme.colors.white_0} weight="bold" />
                      }
                      onPress={optionsSheet.open}
                      isTransparent
                      size={44}
                      radiusSize={12}
                    />
                  </>
                )}
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
        {isGalleryOpen && <StyledSeparator />}
        <div>
          {isEmpty && <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>}
          {!!error && <StyledWrenchErrorMessage />}
          <StyledGridContainer $isGalleryOpen={isGalleryOpen}>
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
                    onClick={() => navigate(`/nft-dashboard/ordinal-detail/${inscription?.id}`)}
                  >
                    <OrdinalImage ordinal={inscription} />
                  </CollectibleCollectionGridItem>
                ))
            )}
          </StyledGridContainer>
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
        </div>
      </Container>
      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
      {optionsSheet.isVisible && (
        <Sheet
          title={tCommon('OPTIONS')}
          visible={optionsSheet.isVisible}
          onClose={optionsSheet.close}
        >
          {collectionHidden ? (
            <StyledButton
              variant="tertiary"
              icon={<ArchiveTray size={24} color={Theme.colors.white_200} />}
              title={t('UNHIDE_COLLECTION')}
              onClick={handleUnHideCollection}
            />
          ) : (
            <StyledButton
              variant="tertiary"
              icon={<ArchiveTray size={24} color={Theme.colors.white_200} />}
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
