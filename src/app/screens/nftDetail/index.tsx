import SquaresFour from '@assets/img/nftDashboard/squares_four.svg';
import UserCircleSlashed from '@assets/img/user_circle_slashed.svg';
import CollectibleDetailTile from '@components/collectibleDetailTile';
import SquareButton from '@components/squareButton';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useOptionsSheet from '@hooks/useOptionsSheet';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowUp, Share, UserCircle } from '@phosphor-icons/react';
import NftImage from '@screens/nftDashboard/nftImage';
import { InfoContainerColumn } from '@screens/ordinalDetail/index.styled';
import { StyledButton } from '@screens/ordinalsCollection/index.styled';
import type { Attribute } from '@secretkeylabs/xverse-core';
import {
  addToStarCollectiblesAction,
  removeAccountAvatarAction,
  removeFromStarCollectiblesAction,
  setAccountAvatarAction,
} from '@stores/wallet/actions/actionCreators';
import Sheet from '@ui-library/sheet';
import SnackBar from '@ui-library/snackBar';
import { EMPTY_LABEL, LONG_TOAST_DURATION } from '@utils/constants';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Theme from '../../../theme';
import NftAttribute from './nftAttribute';
import useNftDetailScreen from './useNftDetail';

import {
  ActionButtonLoader,
  ActionButtonsLoader,
  AttributeText,
  BottomBarContainer,
  Button,
  ButtonContainer,
  ButtonHiglightedText,
  ButtonImage,
  ButtonText,
  CollectibleText,
  DetailSection,
  ExtensionContainer,
  ExtensionLoaderContainer,
  ExtensionNftContainer,
  GridContainer,
  InfoContainer,
  NftDetailsContainer,
  NftTitleText,
  SeeDetailsButtonContainer,
  StyledBarLoader,
  StyledSeparator,
  StyledTooltip,
  TitleLoader,
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
    <NftDetailsContainer>
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

  return (
    <>
      <TopRow onClick={handleBackButtonClick} onMenuClick={optionsSheet.open} />
      {isLoading ? (
        <ExtensionLoaderContainer>
          <TitleLoader>
            <StyledBarLoader width={100} height={18.5} $withMarginBottom />
            <StyledBarLoader width={100} height={30} $withMarginBottom />
          </TitleLoader>
          {!isGalleryOpen && (
            <div>
              <StyledBarLoader width={100} height={18.5} $withMarginBottom />
            </div>
          )}
          <div>
            <StyledBarLoader
              width={isGalleryOpen ? 174 : 136}
              height={isGalleryOpen ? 174 : 136}
              $withMarginBottom
            />
          </div>
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
            <InfoContainerColumn>
              <StyledBarLoader width={100} height={18.5} />
              <StyledBarLoader width={80} height={18.5} />
            </InfoContainerColumn>
            <InfoContainerColumn>
              <StyledBarLoader width={100} height={18.5} />
              <StyledBarLoader width={80} height={18.5} />
            </InfoContainerColumn>
          </InfoContainer>
        </ExtensionLoaderContainer>
      ) : (
        <ExtensionContainer>
          <CollectibleText>{t('COLLECTIBLE')}</CollectibleText>
          <NftTitleText>{nftData?.token_metadata?.name}</NftTitleText>
          {!isGalleryOpen && (
            <WebGalleryButton onClick={openInGalleryView}>
              <>
                <ButtonImage src={SquaresFour} />
                <WebGalleryButtonText>{t('WEB_GALLERY')}</WebGalleryButtonText>
              </>
            </WebGalleryButton>
          )}
          <ExtensionNftContainer $isGalleryOpen={isGalleryOpen}>
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
            <Button onClick={onExplorerPress}>
              <ButtonText>{t('VIEW_CONTRACT')}</ButtonText>
              <ButtonHiglightedText>{t('STACKS_EXPLORER')}</ButtonHiglightedText>
            </Button>
            <Button onClick={onGammaPress}>
              <ButtonText>{t('DETAILS')}</ButtonText>
              <ButtonHiglightedText>{t('GAMMA')}</ButtonHiglightedText>
            </Button>
          </SeeDetailsButtonContainer>
        </ExtensionContainer>
      )}
      <BottomBarContainer>
        <BottomTabBar tab="nft" />
      </BottomBarContainer>
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
