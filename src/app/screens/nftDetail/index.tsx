import SquaresFour from '@assets/img/nftDashboard/squares_four.svg';
import UserCircleSlashed from '@assets/img/user_circle_slashed.svg';
import AccountHeaderComponent from '@components/accountHeader';
import CollectibleDetailTile from '@components/collectibleDetailTile';
import SquareButton from '@components/squareButton';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useOptionsSheet from '@hooks/useOptionsSheet';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  ArrowLeft,
  ArrowUp,
  DotsThreeVertical,
  Share,
  Star,
  UserCircle,
} from '@phosphor-icons/react';
import NftImage from '@screens/nftDashboard/nftImage';
import { StyledButton } from '@screens/ordinalsCollection/index.styled';
import type { Attribute } from '@secretkeylabs/xverse-core';
import {
  addToStarCollectiblesAction,
  removeAccountAvatarAction,
  removeFromStarCollectiblesAction,
  setAccountAvatarAction,
} from '@stores/wallet/actions/actionCreators';
import ActionButton from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import SnackBar from '@ui-library/snackBar';
import { EMPTY_LABEL, LONG_TOAST_DURATION } from '@utils/constants';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Theme from '../../../theme';
import { ExtensionLoader, GalleryLoader } from './loaders';
import NftAttribute from './nftAttribute';
import useNftDetailScreen from './useNftDetail';

import {
  AssetDeatilButtonText,
  AttributeText,
  BackButton,
  BackButtonContainer,
  BottomBarContainer,
  Button,
  ButtonContainer,
  ButtonHiglightedText,
  ButtonImage,
  ButtonText,
  CollectibleText,
  ColumnContainer,
  DescriptionContainer,
  DetailSection,
  ExtensionContainer,
  ExtensionNftContainer,
  GalleryCollectibleText,
  GalleryContainer,
  GalleryRowContainer,
  GalleryScrollContainer,
  GridContainer,
  NftContainer,
  NftDetailsContainer,
  NftGalleryTitleText,
  NftOwnedByText,
  NftTitleText,
  OwnerAddressText,
  RowContainer,
  SeeDetailsButtonContainer,
  StyledTooltip,
  WebGalleryButton,
  WebGalleryButtonText,
} from './index.styled';

function NftDetailScreen() {
  const dispatch = useDispatch();
  const optionsSheet = useOptionsSheet();
  const { t: optionsDialogT } = useTranslation('translation', { keyPrefix: 'OPTIONS_DIALOG' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });
  const {
    nft,
    nftData,
    collection,
    stxAddress,
    isLoading,
    isGalleryOpen,
    onSharePress,
    handleBackButtonClick,
    onGammaPress,
    onExplorerPress,
    openInGalleryView,
    handleOnSendClick,
    galleryTitle,
  } = useNftDetailScreen();
  const { ordinalsAddress } = useSelectedAccount();
  const { avatarIds, hiddenCollectibleIds, starredCollectibleIds } = useWalletSelector();
  const selectedAvatar = avatarIds[ordinalsAddress];
  const isNftSelectedAsAvatar =
    selectedAvatar?.type === 'stacks' && selectedAvatar.nft.token_id === nftData?.token_id;

  const handleSetAvatar = useCallback(() => {
    if (ordinalsAddress && nftData?.token_id) {
      dispatch(
        setAccountAvatarAction({
          address: ordinalsAddress,
          avatar: { type: 'stacks', nft: nftData },
        }),
      );

      const toastId = toast(
        <SnackBar
          text={optionsDialogT('NFT_AVATAR.SET_TOAST')}
          type="neutral"
          action={{
            text: commonT('UNDO'),
            onClick: () => {
              if (selectedAvatar?.type) {
                dispatch(
                  setAccountAvatarAction({ address: ordinalsAddress, avatar: selectedAvatar }),
                );
              } else {
                dispatch(removeAccountAvatarAction({ address: ordinalsAddress }));
              }

              toast.remove(toastId);
              toast(<SnackBar text={optionsDialogT('NFT_AVATAR.UNDO')} type="neutral" />);
            },
          }}
        />,
      );
    }

    optionsSheet.close();
  }, [dispatch, optionsDialogT, commonT, ordinalsAddress, nftData, optionsSheet, selectedAvatar]);

  const handleRemoveAvatar = useCallback(() => {
    dispatch(removeAccountAvatarAction({ address: ordinalsAddress }));
    toast(<SnackBar text={optionsDialogT('NFT_AVATAR.REMOVE_TOAST')} type="neutral" />);
    optionsSheet.close();
  }, [dispatch, optionsDialogT, ordinalsAddress, optionsSheet]);

  const isNftCollectionHidden = Object.keys(hiddenCollectibleIds[stxAddress] ?? {}).some(
    (id) => id === collection?.collection_id,
  );
  const nftId = nftData?.fully_qualified_token_id ?? '';
  const nftStarred = starredCollectibleIds[stxAddress]?.some(({ id }) => id === nftId);

  const handleClickUndoStarring = (toastId: string) => {
    dispatch(
      removeFromStarCollectiblesAction({
        address: stxAddress,
        id: nftId,
      }),
    );
    toast.remove(toastId);
    toast(t('UNSTAR_INSCRIPTION'));
  };

  const handleStarClick = () => {
    if (nftStarred) {
      dispatch(
        removeFromStarCollectiblesAction({
          address: stxAddress,
          id: nftId,
        }),
      );
      toast(t('UNSTAR_INSCRIPTION'));
    } else {
      dispatch(
        addToStarCollectiblesAction({
          address: stxAddress,
          id: nftId,
        }),
      );
      const toastId = toast(
        <SnackBar
          text={t('STAR_INSCRIPTION')}
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

  const nftAttributes = nftData?.nft_token_attributes?.length !== 0 && (
    <>
      <AttributeText>{t('ATTRIBUTES')}</AttributeText>
      <GridContainer>
        {nftData?.nft_token_attributes?.map((attribute: Attribute) => (
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
    <NftDetailsContainer $isGallery={isGalleryOpen}>
      {collection?.collection_name && (
        <DetailSection $isGallery={isGalleryOpen}>
          <CollectibleDetailTile title={t('COLLECTION')} value={collection?.collection_name} />
          <CollectibleDetailTile
            title={t('COLLECTION_FLOOR_PRICE')}
            value={
              collection?.floor_price ? `${collection?.floor_price.toString()} STX` : EMPTY_LABEL
            }
          />
        </DetailSection>
      )}
      {!isGalleryOpen && nftAttributes}
      <DetailSection $isGallery={isGalleryOpen}>
        <CollectibleDetailTile title={t('NAME')} value={nftData?.token_metadata?.name!} />
        {nftData?.rarity_score && (
          <CollectibleDetailTile title={t('RARITY')} value={nftData?.rarity_score} />
        )}
      </DetailSection>
      <CollectibleDetailTile
        title={t('CONTRACT_ID')}
        value={nftData?.token_metadata?.contract_id ?? ''}
      />
    </NftDetailsContainer>
  );

  const extensionView = isLoading ? (
    <ExtensionLoader />
  ) : (
    <ExtensionContainer>
      <CollectibleText>{t('COLLECTIBLE')}</CollectibleText>
      <NftTitleText>{nftData?.token_metadata?.name}</NftTitleText>
      <WebGalleryButton onClick={openInGalleryView}>
        <>
          <ButtonImage src={SquaresFour} />
          <WebGalleryButtonText>{t('WEB_GALLERY')}</WebGalleryButtonText>
        </>
      </WebGalleryButton>
      <ExtensionNftContainer>
        {nft && <NftImage metadata={nftData?.token_metadata} />}
      </ExtensionNftContainer>
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
          hoverDialogId={`copy-nft-url-${nftData?.asset_id}`}
          isTransparent
        />
        <StyledTooltip
          anchorId={`copy-nft-url-${nftData?.asset_id}`}
          variant="light"
          content={t('COPIED')}
          events={['click']}
          place="top"
        />
      </ButtonContainer>
      {nftDetails}
      <SeeDetailsButtonContainer>
        <Button $isGallery={isGalleryOpen} onClick={onExplorerPress}>
          <ButtonText>{t('VIEW_CONTRACT')}</ButtonText>
          <ButtonHiglightedText>{t('STACKS_EXPLORER')}</ButtonHiglightedText>
        </Button>
        <Button $isGallery={isGalleryOpen} onClick={onGammaPress}>
          <ButtonText>{t('DETAILS')}</ButtonText>
          <ButtonHiglightedText>{t('GAMMA')}</ButtonHiglightedText>
        </Button>
      </SeeDetailsButtonContainer>
    </ExtensionContainer>
  );

  const galleryView = isLoading ? (
    <GalleryScrollContainer>
      <GalleryContainer>
        <BackButtonContainer>
          <BackButton data-testid="back-button" onClick={handleBackButtonClick}>
            <>
              <ArrowLeft weight="regular" size="20" color="white" />
              <AssetDeatilButtonText>{t('BACK_TO_COLLECTION')}</AssetDeatilButtonText>
            </>
          </BackButton>
        </BackButtonContainer>

        <GalleryLoader />
      </GalleryContainer>
    </GalleryScrollContainer>
  ) : (
    <GalleryScrollContainer>
      <GalleryContainer>
        <BackButtonContainer>
          <BackButton data-testid="back-button" onClick={handleBackButtonClick}>
            <ArrowLeft weight="regular" size="20" color="white" />
            <AssetDeatilButtonText>{t('BACK_TO_COLLECTION')}</AssetDeatilButtonText>
          </BackButton>
        </BackButtonContainer>
        <GalleryRowContainer>
          <ColumnContainer>
            <NftContainer>{nft && <NftImage metadata={nftData?.token_metadata} />}</NftContainer>
            {nftAttributes}
          </ColumnContainer>
          <DescriptionContainer>
            <GalleryCollectibleText>{t('COLLECTIBLE')}</GalleryCollectibleText>
            <NftGalleryTitleText>{galleryTitle}</NftGalleryTitleText>
            <RowContainer>
              <NftOwnedByText>{t('OWNED_BY')}</NftOwnedByText>
              <OwnerAddressText>
                {`${stxAddress.substring(0, 4)}...${stxAddress.substring(
                  stxAddress.length - 4,
                  stxAddress.length,
                )}`}
              </OwnerAddressText>
            </RowContainer>
            <GalleryRowContainer $withGap>
              <ActionButton
                icon={<ArrowUp weight="bold" size="16" />}
                title={t('SEND')}
                onClick={handleOnSendClick}
              />
              <ActionButton
                id={`copy-nft-url-${nftData?.asset_id}`}
                icon={<Share weight="bold" color="white" size="16" />}
                title={t('SHARE')}
                onClick={onSharePress}
                variant="secondary"
              />
              <StyledTooltip
                anchorId={`copy-nft-url-${nftData?.asset_id}`}
                variant="light"
                content={t('COPIED')}
                events={['click']}
                place="top"
              />
              {isNftCollectionHidden ? null : (
                <>
                  <SquareButton
                    icon={
                      nftStarred ? (
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
            </GalleryRowContainer>
            {nftDetails}
            <Button $isGallery={isGalleryOpen} onClick={onExplorerPress}>
              <ButtonText>{t('VIEW_CONTRACT')}</ButtonText>
              <ButtonHiglightedText>{t('STACKS_EXPLORER')}</ButtonHiglightedText>
            </Button>
            <Button $isGallery={isGalleryOpen} onClick={onGammaPress}>
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
        <TopRow
          onClick={handleBackButtonClick}
          onStarClick={isNftCollectionHidden ? undefined : handleStarClick}
          isStarred={nftStarred}
          onMenuClick={isNftCollectionHidden ? undefined : optionsSheet.open}
        />
      )}
      {isGalleryOpen ? galleryView : extensionView}
      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
      {optionsSheet.isVisible && (
        <Sheet
          title={commonT('OPTIONS')}
          visible={optionsSheet.isVisible}
          onClose={optionsSheet.close}
        >
          {isNftSelectedAsAvatar ? (
            <StyledButton
              variant="tertiary"
              icon={<img src={UserCircleSlashed} alt="Circle Slashed" />}
              title={optionsDialogT('NFT_AVATAR.REMOVE_ACTION')}
              onClick={handleRemoveAvatar}
            />
          ) : (
            <StyledButton
              variant="tertiary"
              icon={<UserCircle size={24} color={Theme.colors.white_200} />}
              title={optionsDialogT('NFT_AVATAR.SET_ACTION')}
              onClick={handleSetAvatar}
            />
          )}
        </Sheet>
      )}
    </>
  );
}

export default NftDetailScreen;
