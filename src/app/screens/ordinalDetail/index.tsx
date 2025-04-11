import UserCircleSlashed from '@assets/img/user_circle_slashed.svg';
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
  ArrowCounterClockwise,
  ArrowUp,
  Share,
  TrayArrowDown,
  TrayArrowUp,
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
import { StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import SnackBar from '@ui-library/snackBar';
import Spinner from '@ui-library/spinner';
import { EMPTY_LABEL, LONG_TOAST_DURATION, XVERSE_ORDIVIEW_URL } from '@utils/constants';
import { isThumbnailInscription } from '@utils/inscriptions';
import { getRareSatsColorsByRareSatsType, getRareSatsLabelByType } from '@utils/rareSats';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Theme from '../../../theme';
import {
  ActionButtonLoader,
  ActionButtonsLoader,
  Badge,
  BottomBarContainer,
  ButtonHiglightedText,
  ButtonText,
  CollectibleText,
  ColumnContainer,
  DetailSection,
  Divider,
  ExtensionContainer,
  ExtensionLoaderContainer,
  ExtensionOrdinalsContainer,
  InfoContainer,
  InfoContainerColumn,
  OrdinalDetailsContainer,
  OrdinalTitleContainer,
  OrdinalTitleText,
  RareSatsBundleCallout,
  Row,
  RowButtonContainer,
  SatributeBadgeLabel,
  SatributesBadgeContainer,
  SatributesBadges,
  SatributesIconsContainer,
  StyledBarLoader,
  StyledSeparator,
  StyledTooltip,
  StyledWebGalleryButton,
  TitleLoader,
  ViewInExplorerButton,
} from './index.styled';
import OrdinalAttributeComponent from './ordinalAttributeComponent';
import useOrdinalDetail from './useOrdinalDetail';

function OrdinalDetailScreen() {
  const optionsSheet = useOptionsSheet();
  const { t: optionsDialogT } = useTranslation('translation', { keyPrefix: 'OPTIONS_DIALOG' });
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const navigate = useNavigate();
  const [refreshingThumbnail, setRefreshingThumbnail] = useState(false);
  const [refreshedThumbnailTimestamp, setRefreshedThumbnailTimestamp] = useState(Date.now());
  const ordinalDetails = useOrdinalDetail();
  const {
    ordinal,
    collectionMarketData,
    isLoading,
    ordinalsAddress,
    showSendOrdinalsAlert,
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
  } = ordinalDetails;
  const { starredCollectibleIds, hiddenCollectibleIds, avatarIds, network } = useWalletSelector();
  const canRefreshInscription = ordinal && isThumbnailInscription(ordinal) && !refreshingThumbnail;
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

  const handleRefreshThumbnail = useCallback(() => {
    setRefreshingThumbnail(true);

    const cacheBustPromise = fetch(
      `${XVERSE_ORDIVIEW_URL(network.type)}/thumbnail/${ordinal?.id}`,
      { method: 'DELETE' },
    )
      .then(async (res) => {
        // must bust cache regardless if no refresh - retrieve server's latest image to ensure browser cache consistency
        // we can do this in the background, no need to await
        fetch(`${XVERSE_ORDIVIEW_URL(network.type)}/thumbnail/${ordinal?.id}`, {
          cache: 'reload',
        })
          .then(() => setRefreshedThumbnailTimestamp(Date.now()))
          .catch(() => {
            // ignore errors
          });

        if (res.ok) {
          toast.success(t('REFRESHING_THUMBNAIL'));
          return;
        }

        const { timeUntilNextRefreshMs } = await res.json();
        if ((timeUntilNextRefreshMs ?? 0) <= 0) {
          toast(t('REFRESHING_THUMBNAIL_ERROR'));
          return;
        }
        const hoursUntilNextRefresh = timeUntilNextRefreshMs / (1000 * 60 * 60);
        if (hoursUntilNextRefresh >= 1) {
          toast(
            t('REFRESHING_THUMBNAIL_TIMEOUT_HOURS', { count: Math.ceil(hoursUntilNextRefresh) }),
            { duration: LONG_TOAST_DURATION },
          );
          return;
        }
        const minutesUntilNextRefresh = Math.ceil(timeUntilNextRefreshMs / (1000 * 60));
        toast(
          t('REFRESHING_THUMBNAIL_TIMEOUT_MINUTES', {
            count: Math.ceil(minutesUntilNextRefresh),
          }),
          { duration: LONG_TOAST_DURATION },
        );
        await cacheBustPromise;
      })
      .catch(() => toast(t('REFRESHING_THUMBNAIL_ERROR')))
      .finally(() => setRefreshingThumbnail(false));

    optionsSheet.close();
  }, [network.type, optionsSheet, ordinal?.id, t]);

  const ordinalDetailAttributes = (
    <OrdinalDetailsContainer>
      {ordinal?.collection_id && (
        <DetailSection isGallery={isGalleryOpen}>
          <CollectibleDetailTile title={t('COLLECTION')} value={ordinal?.collection_name ?? ''} />
          <CollectibleDetailTile
            title={t('COLLECTION_FLOOR_PRICE')}
            value={collectionMarketData?.floor_price?.toFixed(8) ?? EMPTY_LABEL}
            suffixValue="BTC"
          />
        </DetailSection>
      )}
      {ordinal?.collection_id && (
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
      <CollectibleDetailTile title={t('ADDRESS')} value={ordinal?.address!} />
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

  return (
    <>
      <TopRow
        onClick={handleBackButtonClick}
        onStarClick={isHidden ? undefined : handleStarClick}
        isStarred={inscriptionStarred}
        onMenuClick={!isHidden || isStandaloneInscription ? optionsSheet.open : undefined}
      />
      {showSendOrdinalsAlert && (
        <AlertMessage
          title={t('ORDINAL_PENDING_SEND_TITLE')}
          onClose={onCloseAlert}
          buttonText={t('ORDINAL_PENDING_SEND_BUTTON')}
          onButtonClick={handleRedirectToTx}
          description={t('ORDINAL_PENDING_SEND_DESCRIPTION')}
        />
      )}
      {isLoading ? (
        <ExtensionLoaderContainer>
          <TitleLoader>
            <StyledBarLoader width={100} height={18.5} withMarginBottom />
            <StyledBarLoader width={100} height={30} withMarginBottom />
          </TitleLoader>
          {!isGalleryOpen && (
            <div>
              <StyledBarLoader width={100} height={18.5} withMarginBottom />
            </div>
          )}
          <div>
            <StyledBarLoader
              width={isGalleryOpen ? 174 : 136}
              height={isGalleryOpen ? 174 : 136}
              withMarginBottom
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
          <CollectibleText>
            {isBrc20Ordinal ? t('BRC20_INSCRIPTION') : ordinal?.collection_name || t('INSCRIPTION')}
          </CollectibleText>
          <OrdinalTitleContainer>
            <OrdinalTitleText>{ordinal?.number}</OrdinalTitleText>
            {refreshingThumbnail && <Spinner color="white" size={20} />}
          </OrdinalTitleContainer>
          {!isGalleryOpen && <StyledWebGalleryButton onClick={openInGalleryView} />}
          <ExtensionOrdinalsContainer $isGalleryOpen={isGalleryOpen}>
            <OrdinalImage ordinal={ordinal!} thumbnailTimestamp={refreshedThumbnailTimestamp} />
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
          <ViewInExplorerButton onClick={openInOrdinalsExplorer}>
            <ButtonText>{t('VIEW_IN')}</ButtonText>
            <ButtonHiglightedText>{t('ORDINAL_VIEWER')}</ButtonHiglightedText>
          </ViewInExplorerButton>
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
                icon={<TrayArrowUp size={24} color={Theme.colors.white_200} />}
                title={t('UNHIDE_INSCRIPTION')}
                onClick={handleUnHideStandaloneInscription}
              />
            ) : (
              <StyledButton
                variant="tertiary"
                icon={<TrayArrowDown size={24} color={Theme.colors.white_200} />}
                title={t('HIDE_INSCRIPTION')}
                onClick={handleHideStandaloneInscription}
              />
            ))}
          {canRefreshInscription && (
            <StyledButton
              variant="tertiary"
              icon={<ArrowCounterClockwise size={24} color={Theme.colors.white_200} />}
              title={t('REFRESH_THUMBNAIL')}
              onClick={handleRefreshThumbnail}
            />
          )}
        </Sheet>
      )}
    </>
  );
}

export default OrdinalDetailScreen;
