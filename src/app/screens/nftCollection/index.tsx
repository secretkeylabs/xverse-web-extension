import CollectibleCollectionGridItem from '@components/collectibleCollectionGridItem';
import CollectibleDetailTile from '@components/collectibleDetailTile';
import BottomTabBar from '@components/tabBar';
import { StyledBarLoader, TilesSkeletonLoader } from '@components/tilesSkeletonLoader';
import TopRow from '@components/topRow';
import WebGalleryButton from '@components/webGalleryButton';
import WrenchErrorMessage from '@components/wrenchErrorMessage';
import useNftDetail from '@hooks/queries/useNftDetail';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { TrayArrowDown, TrayArrowUp } from '@phosphor-icons/react';
import {
  CollectiblesContainer,
  GridContainer,
} from '@screens/nftDashboard/collectiblesTabs/index.styled';
import Nft from '@screens/nftDashboard/nft';
import NftImage from '@screens/nftDashboard/nftImage';
import { StyledButton } from '@screens/ordinalsCollection/index.styled';
import type { NonFungibleToken, StacksCollectionData } from '@secretkeylabs/xverse-core';
import {
  addToHideCollectiblesAction,
  addToStarCollectiblesAction,
  removeAccountAvatarAction,
  removeFromHideCollectiblesAction,
  removeFromStarCollectiblesAction,
} from '@stores/wallet/actions/actionCreators';
import Sheet from '@ui-library/sheet';
import SnackBar from '@ui-library/snackBar';
import { EMPTY_LABEL, LONG_TOAST_DURATION } from '@utils/constants';
import { getFullyQualifiedKey, getNftCollectionsGridItemId, isBnsCollection } from '@utils/nfts';
import { useRef, useState, type PropsWithChildren } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useIsVisible } from 'react-is-visible';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Theme from 'theme';
import {
  BottomBarContainer,
  CollectionNameDiv,
  CollectionText,
  Container,
  HeadingText,
  NftContainer,
  NoCollectiblesText,
  PageHeader,
  PageHeaderContent,
} from './index.styled';
import useNftCollection from './useNftCollection';

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
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const selectedAccount = useSelectedAccount();
  const { starredCollectibleIds, hiddenCollectibleIds, avatarIds } = useWalletSelector();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
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
  const currentAvatar = avatarIds[selectedAccount.btcAddress];

  const openOptionsDialog = () => {
    setIsOptionsModalVisible(true);
  };

  const closeOptionsDialog = () => {
    setIsOptionsModalVisible(false);
  };

  const collectionStarred = starredCollectibleIds[selectedAccount.stxAddress]?.some(
    ({ id }) => id === collectionData?.collection_id,
  );
  const collectionHidden = Object.keys(hiddenCollectibleIds[selectedAccount.stxAddress] ?? {}).some(
    (id) => id === collectionData?.collection_id,
  );

  const handleUnHideCollection = () => {
    const isLastHiddenItem =
      Object.keys(hiddenCollectibleIds[selectedAccount.stxAddress] ?? {}).length === 1;
    dispatch(
      removeFromHideCollectiblesAction({
        address: selectedAccount.stxAddress,
        id: collectionData?.collection_id ?? '',
      }),
    );
    closeOptionsDialog();
    toast(t('COLLECTION_UNHIDDEN'));
    navigate(`/nft-dashboard/${isLastHiddenItem ? '' : 'hidden'}?tab=nfts`);
  };

  const handleClickUndoHiding = (toastId: string) => {
    dispatch(
      removeFromHideCollectiblesAction({
        address: selectedAccount.stxAddress,
        id: collectionData?.collection_id ?? '',
      }),
    );
    toast.remove(toastId);
    toast(t('COLLECTION_UNHIDDEN'), {
      duration: LONG_TOAST_DURATION,
    });
  };

  const handleHideCollection = () => {
    dispatch(
      addToHideCollectiblesAction({
        address: selectedAccount.stxAddress,
        id: collectionData?.collection_id ?? '',
      }),
    );

    if (currentAvatar?.type === 'stacks') {
      const isHidingUsedAvatar = collectionData?.all_nfts.some(
        (nft) =>
          `${nft.asset_identifier}:${nft.identifier.tokenId}` ===
          currentAvatar.nft.fully_qualified_token_id,
      );

      if (isHidingUsedAvatar) {
        dispatch(removeAccountAvatarAction({ address: selectedAccount.btcAddress }));
      }
    }

    closeOptionsDialog();
    navigate('/nft-dashboard?tab=nfts');
    const toastId = toast(
      <SnackBar
        text={t('COLLECTION_HIDDEN')}
        type="neutral"
        action={{
          text: commonT('UNDO'),
          onClick: () => handleClickUndoHiding(toastId),
        }}
      />,
      { duration: LONG_TOAST_DURATION },
    );
  };

  const handleClickUndoStarring = (toastId: string) => {
    dispatch(
      removeFromStarCollectiblesAction({
        address: selectedAccount.stxAddress,
        id: collectionData?.collection_id ?? '',
      }),
    );
    toast.remove(toastId);
    toast(t('UNSTAR_COLLECTION'));
  };

  const handleStarClick = () => {
    if (collectionStarred) {
      dispatch(
        removeFromStarCollectiblesAction({
          address: selectedAccount.stxAddress,
          id: collectionData?.collection_id ?? '',
        }),
      );
      toast(t('UNSTAR_COLLECTION'), {
        duration: LONG_TOAST_DURATION,
      });
    } else {
      dispatch(
        addToStarCollectiblesAction({
          address: selectedAccount.stxAddress,
          id: collectionData?.collection_id ?? '',
        }),
      );
      const toastId = toast(
        <SnackBar
          text={t('STAR_COLLECTION')}
          type="neutral"
          action={{
            text: commonT('UNDO'),
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
        onClick={handleBackButtonClick}
        onMenuClick={openOptionsDialog}
        onStarClick={collectionHidden ? undefined : handleStarClick}
        isStarred={collectionStarred}
      />
      <Container>
        <PageHeader>
          <PageHeaderContent $isGalleryOpen={isGalleryOpen}>
            <div>
              <HeadingText>{t('COLLECTION')}</HeadingText>
              <CollectionNameDiv>
                <CollectionText>
                  {collectionData?.collection_name || <StyledBarLoader width={200} height={28} />}
                </CollectionText>
              </CollectionNameDiv>
              {!isGalleryOpen && <WebGalleryButton onClick={openInGalleryView} />}
            </div>
            <NftContainer $isGalleryOpen={isGalleryOpen}>
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
        <CollectiblesContainer>
          {isEmpty && <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>}
          {!!isError && <WrenchErrorMessage />}
          <GridContainer $isGalleryOpen={isGalleryOpen}>
            {isLoading ? (
              <TilesSkeletonLoader
                isGalleryOpen={isGalleryOpen}
                tileSize={isGalleryOpen ? 171 : 151}
              />
            ) : (
              collectionData?.all_nfts.map((nft) => (
                <IsVisibleOrPlaceholder key={getFullyQualifiedKey(nft.identifier)}>
                  <CollectionGridItemWithData
                    nft={nft}
                    collectionData={collectionData}
                    isGalleryOpen={isGalleryOpen}
                  />
                </IsVisibleOrPlaceholder>
              ))
            )}
          </GridContainer>
        </CollectiblesContainer>
      </Container>
      <BottomBarContainer>
        <BottomTabBar tab="nft" />
      </BottomBarContainer>
      {isOptionsModalVisible && (
        <Sheet
          title={commonT('OPTIONS')}
          visible={isOptionsModalVisible}
          onClose={closeOptionsDialog}
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

export default NftCollection;
