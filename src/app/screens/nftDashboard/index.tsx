import FeatureIcon from '@assets/img/nftDashboard/rareSats/NewFeature.svg';
import AccountHeaderComponent from '@components/accountHeader';
import ActionButton from '@components/button';
import ShowOrdinalReceiveAlert from '@components/showOrdinalReceiveAlert';
import BottomTabBar from '@components/tabBar';
import WebGalleryButton from '@components/webGalleryButton';
import useAddressInscriptions from '@hooks/queries/ordinals/useAddressInscriptions';
import { useAddressRareSats } from '@hooks/queries/ordinals/useAddressRareSats';
import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowDown, Wrench } from '@phosphor-icons/react';
import Ordinal from '@screens/ordinals';
import { InscriptionsList } from '@secretkeylabs/xverse-core/types';
import {
  ChangeActivateOrdinalsAction,
  ChangeActivateRareSatsAction,
  SetRareSatsNoticeDismissedAction,
} from '@stores/wallet/actions/actionCreators';
import { useDispatch } from 'react-redux';
import { StyledHeading } from '@ui-library/common.styled';
import Dialog from '@ui-library/dialog';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';
import CollectiblesTabs, { GridContainer } from './collectiblesTabs';
import Nft from './nft';
import ReceiveNftModal from './receiveNft';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  ${(props) => props.theme.scrollbar}
`;

const PageHeader = styled.div`
  padding: ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.xl};
  border-bottom: 0.5px solid ${(props) => props.theme.colors.background.elevation3};
  max-width: 1224px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

const StyledCollectiblesTabs = styled(CollectiblesTabs)`
  margin-top: ${(props) => props.theme.spacing(8)}px;
  padding: 0 ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.xl};
  max-width: 1224px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

const StyledWebGalleryButton = styled(WebGalleryButton)`
  margin-top: ${(props) => props.theme.space.s};
`;

const ReceiveNftContainer = styled.div((props) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 2000,
  background: props.theme.colors.background.elevation2,
  borderRadius: 16,
}));

const CollectibleContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(12),
}));

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

const ButtonContainer = styled.div({
  display: 'flex',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  maxWidth: 360,
});

const ReceiveButtonContainer = styled.div(() => ({
  width: '100%',
}));

const BottomBarContainer = styled.div({
  marginTop: '5%',
});

const LoadMoreButtonContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: props.theme.spacing(30),
  marginTop: props.theme.space.xl,
}));

const LoadMoreButton = styled.button((props) => ({
  ...props.theme.body_medium_l,
  fontSize: 13,
  width: 98,
  height: 34,
  color: props.theme.colors.white['0'],
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  background: props.theme.colors.background.elevation0,
  borderRadius: 24,
  padding: '8px, 16px, 8px, 16px',
  ':hover': {
    background: props.theme.colors.background.elevation9,
  },
  ':focus': {
    background: props.theme.colors.background.elevation10,
  },
}));

const NoCollectiblesText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(16),
  marginBottom: 'auto',
  textAlign: 'center',
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const ErrorTextContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const ErrorText = styled.div((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['200'],
}));

export type NftDashboardState = {
  openReceiveModal: boolean;
  showNewFeatureAlert: boolean;
  isOrdinalReceiveAlertVisible: boolean;
  isLoading: boolean;
  isLoadingOrdinals: boolean;
  openInGalleryView: () => void;
  onReceiveModalOpen: () => void;
  onReceiveModalClose: () => void;
  onOrdinalReceiveAlertOpen: () => void;
  onOrdinalReceiveAlertClose: () => void;
  NftListView: () => JSX.Element;
  onActivateRareSatsAlertCrossPress: () => void;
  onActivateRareSatsAlertDenyPress: () => void;
  onActivateRareSatsAlertEnablePress: () => void;
  onDismissRareSatsNotice: () => void;
  isGalleryOpen: boolean;
  hasActivatedOrdinalsKey?: boolean;
  hasActivatedRareSatsKey?: boolean;
  showNoticeAlert?: boolean;
  rareSatsQuery: ReturnType<typeof useAddressRareSats>;
  totalNfts: number;
  onLoadMoreRareSatsButtonClick: () => void;
};

const useNftDashboard = (): NftDashboardState => {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const dispatch = useDispatch();
  const {
    stxAddress,
    ordinalsAddress,
    hasActivatedOrdinalsKey,
    hasActivatedRareSatsKey,
    rareSatsNoticeDismissed,
  } = useWalletSelector();
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [showNewFeatureAlert, setShowNewFeatureAlert] = useState(false);
  const [showNoticeAlert, setShowNoticeAlert] = useState(false);
  const [isOrdinalReceiveAlertVisible, setIsOrdinalReceiveAlertVisible] = useState(false);
  const {
    data: nftsList,
    error: stacksError,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    fetchNextPage,
  } = useStacksCollectibles();
  const {
    data: ordinals,
    error: ordinalsError,
    hasNextPage: hasNextPageOrdinals,
    isFetchingNextPage: isFetchingNextPageOrdinals,
    isLoading: isLoadingOrdinals,
    fetchNextPage: fetchNextOrdinalsPage,
    refetch: refetchOrdinals,
  } = useAddressInscriptions();

  const rareSatsQuery = useAddressRareSats();

  const refetchCollectibles = useCallback(async () => {
    await refetch();
    await refetchOrdinals();
  }, [refetch, refetchOrdinals]);

  useEffect(() => {
    refetchCollectibles();
  }, [stxAddress, ordinalsAddress]);

  const nfts = nftsList?.pages.map((page) => page.nftsList).flat();

  const ordinalsLength = ordinals?.pages[0].total;

  const totalNfts = useMemo(() => {
    let totalCount = nftsList && nftsList.pages.length > 0 ? nftsList.pages[0].total : 0;
    if (hasActivatedOrdinalsKey && ordinalsLength) {
      totalCount = ordinalsLength + totalCount;
    }
    return totalCount;
  }, [nftsList, hasActivatedOrdinalsKey, ordinalsLength]);

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  useEffect(() => {
    if (
      (hasActivatedOrdinalsKey === undefined && ordinalsLength) ||
      hasActivatedRareSatsKey === undefined
    ) {
      setShowNewFeatureAlert(true);
    }
  }, [hasActivatedOrdinalsKey, hasActivatedRareSatsKey, ordinalsLength]);

  useEffect(() => {
    setShowNoticeAlert(rareSatsNoticeDismissed === undefined);
  }, [rareSatsNoticeDismissed]);

  const onLoadMoreButtonClick = () => {
    if (hasNextPageOrdinals) {
      fetchNextOrdinalsPage();
    }
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/nft-dashboard'),
    });
  };

  const onReceiveModalOpen = () => {
    setOpenReceiveModal(true);
  };

  const onReceiveModalClose = () => {
    setOpenReceiveModal(false);
  };

  const renderOrdinalsList = useCallback(
    (list: InscriptionsList) =>
      list.results.map((ordinal) => (
        <Ordinal asset={ordinal} key={ordinal.id} isGalleryOpen={isGalleryOpen} />
      )),
    [],
  );

  const onOrdinalReceiveAlertOpen = () => {
    setIsOrdinalReceiveAlertVisible(true);
  };

  const onOrdinalReceiveAlertClose = () => {
    setIsOrdinalReceiveAlertVisible(false);
  };

  const NftListView = useCallback(() => {
    if (stacksError || ordinalsError) {
      return (
        <ErrorContainer>
          <Wrench size={48} />
          <ErrorTextContainer>
            <ErrorText>{t('ERROR_RETRIEVING')}</ErrorText>
            <ErrorText>{t('TRY_AGAIN')}</ErrorText>
          </ErrorTextContainer>
        </ErrorContainer>
      );
    }

    if (totalNfts === 0 && ordinalsLength === 0) {
      return <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>;
    }

    return (
      <>
        <GridContainer isGalleryOpen={isGalleryOpen}>
          {hasActivatedOrdinalsKey && !ordinalsError && ordinals?.pages?.map(renderOrdinalsList)}
          {!stacksError &&
            nfts?.map((nft) => (
              <Nft
                asset={nft}
                key={`${nft.asset_identifier}${nft.value.hex}`}
                isGalleryOpen={isGalleryOpen}
              />
            ))}
        </GridContainer>
        {(hasNextPage || hasNextPageOrdinals) && (
          <LoadMoreButtonContainer>
            {isFetchingNextPage || isFetchingNextPageOrdinals ? (
              <MoonLoader color="white" size={30} />
            ) : (
              <LoadMoreButton onClick={onLoadMoreButtonClick}>{t('LOAD_MORE')}</LoadMoreButton>
            )}
          </LoadMoreButtonContainer>
        )}
      </>
    );
  }, [ordinals, nfts, hasActivatedOrdinalsKey, stacksError, ordinalsError]);

  const onActivateRareSatsAlertCrossPress = () => {
    setShowNewFeatureAlert(false);
  };

  const onActivateRareSatsAlertDenyPress = () => {
    setShowNewFeatureAlert(false);
    dispatch(ChangeActivateOrdinalsAction(true));
    dispatch(ChangeActivateRareSatsAction(false));
  };

  const onActivateRareSatsAlertEnablePress = () => {
    setShowNewFeatureAlert(false);
    dispatch(ChangeActivateOrdinalsAction(true));
    dispatch(ChangeActivateRareSatsAction(true));
  };

  const onDismissRareSatsNotice = () => {
    setShowNoticeAlert(false);
    dispatch(SetRareSatsNoticeDismissedAction(true));
  };

  const onLoadMoreRareSatsButtonClick = () => {
    if (rareSatsQuery?.hasNextPage) {
      rareSatsQuery.fetchNextPage();
    }
  };

  return {
    openReceiveModal,
    showNewFeatureAlert,
    isOrdinalReceiveAlertVisible,
    isLoading,
    isLoadingOrdinals,
    openInGalleryView,
    onReceiveModalOpen,
    onReceiveModalClose,
    onOrdinalReceiveAlertOpen,
    onOrdinalReceiveAlertClose,
    NftListView,
    onActivateRareSatsAlertCrossPress,
    onActivateRareSatsAlertDenyPress,
    onActivateRareSatsAlertEnablePress,
    onDismissRareSatsNotice,
    isGalleryOpen,
    hasActivatedOrdinalsKey,
    hasActivatedRareSatsKey,
    showNoticeAlert,
    rareSatsQuery,
    totalNfts,
    onLoadMoreRareSatsButtonClick,
  };
};

function NftDashboard() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const nftDashboard = useNftDashboard();
  const {
    openReceiveModal,
    showNewFeatureAlert,
    hasActivatedOrdinalsKey,
    isOrdinalReceiveAlertVisible,
    isLoading,
    isLoadingOrdinals,
    openInGalleryView,
    onReceiveModalOpen,
    onReceiveModalClose,
    onOrdinalReceiveAlertOpen,
    onOrdinalReceiveAlertClose,
    NftListView,
    onActivateRareSatsAlertCrossPress,
    onActivateRareSatsAlertDenyPress,
    onActivateRareSatsAlertEnablePress,
    isGalleryOpen,
  } = nftDashboard;

  return (
    <>
      {isOrdinalReceiveAlertVisible && (
        <ShowOrdinalReceiveAlert onOrdinalReceiveAlertClose={onOrdinalReceiveAlertClose} />
      )}

      {showNewFeatureAlert && (
        <Dialog
          title={t('NEW_FEATURE')}
          description={
            hasActivatedOrdinalsKey
              ? t('NEW_FEAT_RARE_SATS_ORDINALS_ENABLE')
              : t('NEW_FEAT_RARE_SATS_DESCRIPTION')
          }
          rightButtonText={t('ENABLE')}
          leftButtonText={t('MAYBE_LATER')}
          onRightButtonClick={onActivateRareSatsAlertEnablePress}
          onLeftButtonClick={onActivateRareSatsAlertDenyPress}
          onClose={onActivateRareSatsAlertCrossPress}
          type="feedback"
          icon={<img src={FeatureIcon} width="60" height="60" alt="new feature" />}
        />
      )}

      <AccountHeaderComponent disableMenuOption={isGalleryOpen} showBorderBottom={false} />
      <Container>
        <PageHeader>
          <CollectibleContainer>
            <StyledHeading typography={isGalleryOpen ? 'headline_xl' : 'headline_l'}>
              {t('COLLECTIBLES')}
            </StyledHeading>
            {!isGalleryOpen && <StyledWebGalleryButton onClick={openInGalleryView} />}
          </CollectibleContainer>
          <ButtonContainer>
            <ReceiveButtonContainer>
              <ActionButton
                icon={<ArrowDown weight="bold" size={16} />}
                text={t('RECEIVE')}
                onPress={onReceiveModalOpen}
              />
            </ReceiveButtonContainer>
            {openReceiveModal && (
              <ReceiveNftContainer>
                <ReceiveNftModal
                  visible={openReceiveModal}
                  isGalleryOpen={isGalleryOpen}
                  onClose={onReceiveModalClose}
                  setOrdinalReceiveAlert={onOrdinalReceiveAlertOpen}
                />
              </ReceiveNftContainer>
            )}
          </ButtonContainer>
        </PageHeader>
        {isLoading || isLoadingOrdinals ? (
          <LoaderContainer>
            <MoonLoader color="white" size={30} />
          </LoaderContainer>
        ) : (
          <StyledCollectiblesTabs nftListView={<NftListView />} nftDashboard={nftDashboard} />
        )}
      </Container>

      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
    </>
  );
}

export default NftDashboard;
