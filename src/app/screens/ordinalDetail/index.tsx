import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import UserCircleSlashed from '@assets/img/user_circle_slashed.svg';
import AccountHeaderComponent from '@components/accountHeader';
import AlertMessage from '@components/alertMessage';
import CollectibleDetailTile from '@components/collectibleDetailTile';
import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import SquareButton from '@components/squareButton';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useOptionsSheet from '@hooks/useOptionsSheet';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  ArchiveTray,
  ArrowUp,
  DotsThreeVertical,
  Share,
  Star,
  UserCircle,
} from '@phosphor-icons/react';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { StyledButton } from '@screens/ordinalsCollection/index.styled';
import {
  addToHideCollectiblesAction,
  addToStarCollectiblesAction,
  removeAccountAvatarAction,
  removeFromHideCollectiblesAction,
  removeFromStarCollectiblesAction,
  setAccountAvatarAction,
} from '@stores/wallet/actions/actionCreators';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import SnackBar from '@ui-library/snackBar';
import { EMPTY_LABEL, LONG_TOAST_DURATION } from '@utils/constants';
import { getRareSatsColorsByRareSatsType, getRareSatsLabelByType } from '@utils/rareSats';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Theme from '../../../theme';
import {
  BackButtonContainer,
  Badge,
  BottomBarContainer,
  ButtonContainer,
  ButtonHiglightedText,
  ButtonText,
  CollectibleText,
  ColumnContainer,
  DataItemsContainer,
  DescriptionContainer,
  DescriptionText,
  DetailSection,
  Divider,
  ExtensionContainer,
  ExtensionOrdinalsContainer,
  GalleryButtonContainer,
  GalleryCollectibleText,
  GalleryContainer,
  GalleryScrollContainer,
  OrdinalDetailsContainer,
  OrdinalGalleryTitleText,
  OrdinalsContainer,
  OrdinalTitleText,
  RareSatsBundleCallout,
  Row,
  RowButtonContainer,
  RowContainer,
  SatributeBadgeLabel,
  SatributesBadgeContainer,
  SatributesBadges,
  SatributesIconsContainer,
  StyledBarLoader,
  StyledTooltip,
  StyledWebGalleryButton,
  ViewInExplorerButton,
} from './index.styled';
import { ExtensionLoader, GalleryLoader } from './loaders';
import OrdinalAttributeComponent from './ordinalAttributeComponent';
import useOrdinalDetail from './useOrdinalDetail';

function OrdinalDetailScreen() {
  const optionsSheet = useOptionsSheet();
  const { t: optionsDialogT } = useTranslation('translation', { keyPrefix: 'OPTIONS_DIALOG' });
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const navigate = useNavigate();

  const ordinalDetails = useOrdinalDetail();
  const {
    ordinal,
    collectionMarketData,
    isLoading,
    ordinalsAddress,
    showSendOridnalsAlert,
    brc20Details,
    isPartOfABundle,
    ordinalSatributes,
    isGalleryOpen,
    brc20InscriptionStatus,
    brc20InscriptionStatusColor,
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
  const { starredCollectibleIds, hiddenCollectibleIds, avatarIds } = useWalletSelector();
  const selectedAvatar = avatarIds[ordinalsAddress];
  const isInscriptionSelectedAsAvatar =
    selectedAvatar?.type === 'inscription' && selectedAvatar.inscription.id === ordinal?.id;
  const inscriptionStarred = starredCollectibleIds[ordinalsAddress]?.some(
    ({ id }) => id === ordinal?.id,
  );
  const isStandaloneInscription = !ordinal?.collection_id;
  const isInscriptionHidden = Object.keys(hiddenCollectibleIds[ordinalsAddress] ?? {}).some(
    (id) => id === ordinal?.id,
  );
  const isInscriptionCollectionHidden = Object.keys(
    hiddenCollectibleIds[ordinalsAddress] ?? {},
  ).some((id) => id === ordinal?.collection_id);
  const isHidden = isInscriptionHidden || isInscriptionCollectionHidden;
  const isBrc20Ordinal = Boolean(brc20Details);
  const dispatch = useDispatch();

  useResetUserFlow('/ordinal-detail');

  const handleUnstarClick = (toastId: string) => {
    dispatch(removeFromStarCollectiblesAction({ address: ordinalsAddress, id: ordinal?.id ?? '' }));
    toast.remove(toastId);
    toast(t('UNSTAR_INSCRIPTION'));
  };

  const handleStarClick = () => {
    if (inscriptionStarred) {
      dispatch(
        removeFromStarCollectiblesAction({ address: ordinalsAddress, id: ordinal?.id ?? '' }),
      );
      toast(t('UNSTAR_INSCRIPTION'));
    } else {
      const toastId = toast(
        <SnackBar
          text={t('STAR_INSCRIPTION')}
          type="neutral"
          action={{
            text: commonT('UNDO'),
            onClick: () => handleUnstarClick(toastId),
          }}
        />,
        { duration: LONG_TOAST_DURATION },
      );
      dispatch(
        addToStarCollectiblesAction({
          address: ordinalsAddress,
          id: ordinal?.id ?? '',
          collectionId: ordinal?.collection_id ?? '',
        }),
      );
    }
  };

  const handleClickUndoHiding = (toastId: string) => {
    dispatch(removeFromHideCollectiblesAction({ address: ordinalsAddress, id: ordinal?.id ?? '' }));
    toast.remove(toastId);
    toast(t('INSCRIPTION_UNHIDDEN'));
  };

  const handleHideStandaloneInscription = () => {
    dispatch(addToHideCollectiblesAction({ address: ordinalsAddress, id: ordinal?.id ?? '' }));

    if (isInscriptionSelectedAsAvatar) {
      dispatch(removeAccountAvatarAction({ address: ordinalsAddress }));
    }

    optionsSheet.close();
    navigate('/nft-dashboard?tab=inscriptions');
    const toastId = toast(
      <SnackBar
        text={t('INSCRIPTION_HIDDEN')}
        type="neutral"
        action={{
          text: commonT('UNDO'),
          onClick: () => handleClickUndoHiding(toastId),
        }}
      />,
      { duration: LONG_TOAST_DURATION },
    );
  };

  const handleUnHideStandaloneInscription = () => {
    const isLastHiddenItem = Object.keys(hiddenCollectibleIds[ordinalsAddress] ?? {}).length === 1;
    dispatch(removeFromHideCollectiblesAction({ address: ordinalsAddress, id: ordinal?.id ?? '' }));
    optionsSheet.close();
    toast(t('INSCRIPTION_UNHIDDEN'));
    navigate(`/nft-dashboard/${isLastHiddenItem ? '' : 'hidden'}?tab=inscriptions`);
  };

  const handleSetAvatar = useCallback(() => {
    if (ordinalsAddress && ordinal?.id) {
      dispatch(
        setAccountAvatarAction({
          address: ordinalsAddress,
          avatar: { type: 'inscription', inscription: ordinal },
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
              toast(optionsDialogT('NFT_AVATAR.UNDO'));
            },
          }}
        />,
      );
    }

    optionsSheet.close();
  }, [dispatch, optionsDialogT, commonT, ordinalsAddress, ordinal, optionsSheet, selectedAvatar]);

  const handleRemoveAvatar = useCallback(() => {
    dispatch(removeAccountAvatarAction({ address: ordinalsAddress }));
    toast(optionsDialogT('NFT_AVATAR.REMOVE_TOAST'));
    optionsSheet.close();
  }, [dispatch, ordinalsAddress, optionsDialogT, optionsSheet]);

  const ordinalDetailAttributes = (
    <OrdinalDetailsContainer isGallery={isGalleryOpen}>
      {!isGalleryOpen && ordinal?.collection_id && (
        <DetailSection isGallery={isGalleryOpen}>
          <CollectibleDetailTile title={t('COLLECTION')} value={ordinal?.collection_name ?? ''} />
          <CollectibleDetailTile
            title={t('COLLECTION_FLOOR_PRICE')}
            value={collectionMarketData?.floor_price?.toFixed(8) ?? EMPTY_LABEL}
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
              : EMPTY_LABEL
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
    if (!brc20Details) {
      return null;
    }

    const { op, value, lim, dec } = brc20Details;

    switch (op) {
      case 'mint':
        return (
          <ColumnContainer>
            <DetailSection isGallery={isGalleryOpen}>
              <OrdinalAttributeComponent title={t('AMOUNT_TO_MINT')} value={value} />
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
      case 'transfer':
        return (
          <ColumnContainer>
            <DetailSection isGallery={isGalleryOpen}>
              <OrdinalAttributeComponent title={t('AMOUNT_TO_TRANSFER')} value={value} />
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
              <OrdinalAttributeComponent title={t('TOTAL_SUPPLY')} value={value} />
              {lim && <OrdinalAttributeComponent title={t('MINT_LIMIT')} value={lim} />}
            </Row>
            {dec && (
              <Row>
                <OrdinalAttributeComponent title={t('DECIMALS')} value={dec} />
              </Row>
            )}
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
  };

  const rareSats = isPartOfABundle && (
    <RareSatsBundleCallout
      isGallery={isGalleryOpen}
      bodyText={t('RARE_SATS_BUNDLE_DESCRIPTION')}
      redirectText={t('RARE_SATS_BUNDLE_LINK')}
      onClickRedirect={handleNavigationToRareSatsBundle}
    />
  );

  const showSatributes = ordinalSatributes.length > 0;
  const satributesIcons = showSatributes && (
    <SatributesIconsContainer isGallery={isGalleryOpen}>
      {ordinalSatributes.map((satribute) => (
        <RareSatIcon key={satribute} type={satribute} size={24} />
      ))}
    </SatributesIconsContainer>
  );
  const stributesBadges = showSatributes && (
    <SatributesBadgeContainer isGallery={isGalleryOpen}>
      <StyledP typography="body_medium_m" color="white_400">
        {commonT('SATRIBUTES')}
      </StyledP>
      <SatributesBadges isGallery={isGalleryOpen}>
        {ordinalSatributes.map((satribute, index) => {
          const backgroundColor = getRareSatsColorsByRareSatsType(satribute) ?? 'transparent';
          return (
            <Badge
              key={satribute}
              backgroundColor={backgroundColor}
              isLastItem={index + 1 >= ordinalSatributes.length}
            >
              <RareSatIcon key={satribute} type={satribute} size={24} />
              <SatributeBadgeLabel typography="body_medium_m">
                {getRareSatsLabelByType(satribute)}
              </SatributeBadgeLabel>
            </Badge>
          );
        })}
      </SatributesBadges>
    </SatributesBadgeContainer>
  );

  const extensionView = isLoading ? (
    <ExtensionLoader />
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
      {satributesIcons}
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
      <Divider />
      {stributesBadges}
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
          <Button
            variant="tertiary"
            icon={<img src={ArrowLeft} alt="go back" />}
            data-testid="back-to-gallery"
            onClick={handleBackButtonClick}
            title={backButtonText}
          />
        </BackButtonContainer>

        <RowContainer withGap>
          <StyledBarLoader width={376.5} height={376.5} />
          <GalleryLoader />
        </RowContainer>
      </GalleryContainer>
    </GalleryScrollContainer>
  ) : (
    <GalleryScrollContainer>
      <GalleryContainer>
        <BackButtonContainer>
          <Button
            variant="tertiary"
            icon={<img src={ArrowLeft} alt="go back" />}
            data-testid="back-button"
            onClick={handleBackButtonClick}
            title={backButtonText}
          />
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
            <OrdinalGalleryTitleText data-testid="ordinal-number">
              {ordinal?.number}
            </OrdinalGalleryTitleText>
            {satributesIcons}
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
                <Button
                  icon={<ArrowUp weight="bold" size="16" />}
                  title={t('SEND')}
                  onClick={handleSendOrdinal}
                />
              </GalleryButtonContainer>
              <GalleryButtonContainer>
                <Button
                  icon={<Share weight="bold" color="white" size="16" />}
                  title={t('SHARE')}
                  onClick={onCopyClick}
                  id={`copy-url-${ordinal?.id}`}
                  variant="secondary"
                />
                <StyledTooltip
                  anchorId={`copy-url-${ordinal?.id}`}
                  content={t('COPIED')}
                  events={['click']}
                  place="top"
                  variant="light"
                />
              </GalleryButtonContainer>
              {!isHidden && (
                <SquareButton
                  icon={
                    inscriptionStarred ? (
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
              {(!isHidden || isStandaloneInscription) && (
                <SquareButton
                  icon={<DotsThreeVertical size={20} color={Theme.colors.white_0} weight="bold" />}
                  onPress={optionsSheet.open}
                  isTransparent
                  size={44}
                  radiusSize={12}
                />
              )}
            </ButtonContainer>
            <DescriptionText>{t('DATA')}</DescriptionText>
            {rareSats}
            <DataItemsContainer>
              {stributesBadges}
              {isBrc20Ordinal ? showBrc20OrdinalDetail(true) : ordinalDetailAttributes}
            </DataItemsContainer>
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
        <TopRow
          onClick={handleBackButtonClick}
          onStarClick={isHidden ? undefined : handleStarClick}
          isStarred={inscriptionStarred}
          onMenuClick={!isHidden || isStandaloneInscription ? optionsSheet.open : undefined}
        />
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
      {optionsSheet.isVisible && (
        <Sheet
          title={commonT('OPTIONS')}
          visible={optionsSheet.isVisible}
          onClose={optionsSheet.close}
        >
          {!isHidden &&
            (isInscriptionSelectedAsAvatar ? (
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
            ))}
          {isStandaloneInscription &&
            (isInscriptionHidden ? (
              <StyledButton
                variant="tertiary"
                icon={<ArchiveTray size={24} color={Theme.colors.white_200} />}
                title={t('UNHIDE_INSCRIPTION')}
                onClick={handleUnHideStandaloneInscription}
              />
            ) : (
              <StyledButton
                variant="tertiary"
                icon={<ArchiveTray size={24} color={Theme.colors.white_200} />}
                title={t('HIDE_INSCRIPTION')}
                onClick={handleHideStandaloneInscription}
              />
            ))}
        </Sheet>
      )}
    </>
  );
}

export default OrdinalDetailScreen;
