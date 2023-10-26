import FeatureIcon from '@assets/img/nftDashboard/rareSats/NewFeature.svg';
import AccountHeaderComponent from '@components/accountHeader';
import ActionButton from '@components/button';
import ShowOrdinalReceiveAlert from '@components/showOrdinalReceiveAlert';
import BottomTabBar from '@components/tabBar';
import WebGalleryButton from '@components/webGalleryButton';
import useAddressInscriptionCollections from '@hooks/queries/ordinals/useAddressInscriptionCollections';
import { useAddressRareSats } from '@hooks/queries/ordinals/useAddressRareSats';
import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowDown, Wrench } from '@phosphor-icons/react';
import type { InscriptionCollectionsData } from '@secretkeylabs/xverse-core/types';
import {
  ChangeActivateOrdinalsAction,
  ChangeActivateRareSatsAction,
  SetRareSatsNoticeDismissedAction,
} from '@stores/wallet/actions/actionCreators';
import { StyledHeading } from '@ui-library/common.styled';
import Dialog from '@ui-library/dialog';
import { getCollectionKey } from '@utils/inscriptions';
import { InvalidParamsError } from '@utils/query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import CollectiblesTabs, { GridContainer } from './collectiblesTabs';
import { InscriptionsTabGridItem } from './inscriptionsTabGridItem';
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
  border-bottom: 0.5px solid ${(props) => props.theme.colors.elevation3};
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
  background: props.theme.colors.elevation2,
  borderRadius: 16,
}));

const CollectibleContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(12),
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

const NoCollectiblesText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
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
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
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

export type NftDashboardState = {
  openReceiveModal: boolean;
  showNewFeatureAlert: boolean;
  isOrdinalReceiveAlertVisible: boolean;
  stacksNftsQuery: ReturnType<typeof useStacksCollectibles>;
  inscriptionsQuery: ReturnType<typeof useAddressInscriptionCollections>;
  rareSatsQuery: ReturnType<typeof useAddressRareSats>;
  openInGalleryView: () => void;
  onReceiveModalOpen: () => void;
  onReceiveModalClose: () => void;
  onOrdinalReceiveAlertOpen: () => void;
  onOrdinalReceiveAlertClose: () => void;
  InscriptionListView: () => JSX.Element;
  NftListView: () => JSX.Element;
  onActivateRareSatsAlertCrossPress: () => void;
  onActivateRareSatsAlertDenyPress: () => void;
  onActivateRareSatsAlertEnablePress: () => void;
  onDismissRareSatsNotice: () => void;
  isGalleryOpen: boolean;
  hasActivatedOrdinalsKey?: boolean;
  hasActivatedRareSatsKey?: boolean;
  showNoticeAlert?: boolean;
  totalNfts: number;
  totalInscriptions: number;
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
  const stacksNftsQuery = useStacksCollectibles();
  const inscriptionsQuery = useAddressInscriptionCollections();
  const rareSatsQuery = useAddressRareSats();

  useEffect(() => {
    stacksNftsQuery.refetch();
  }, [stxAddress, stacksNftsQuery]);

  useEffect(() => {
    inscriptionsQuery.refetch();
  }, [ordinalsAddress, inscriptionsQuery]);

  const ordinalsLength = inscriptionsQuery.data?.pages?.[0]?.total ?? 0;
  const totalNfts = stacksNftsQuery.data?.pages?.[0]?.total ?? 0;

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

  const onOrdinalReceiveAlertOpen = () => {
    setIsOrdinalReceiveAlertVisible(true);
  };

  const onOrdinalReceiveAlertClose = () => {
    setIsOrdinalReceiveAlertVisible(false);
  };

  const InscriptionListView = useCallback(() => {
    const onClickLoadMoreInscriptions = () => {
      inscriptionsQuery.fetchNextPage();
    };

    if (inscriptionsQuery.error && !(inscriptionsQuery.error instanceof InvalidParamsError)) {
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

    if (ordinalsLength === 0) {
      return <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>;
    }

    return (
      <>
        <GridContainer isGalleryOpen={isGalleryOpen}>
          {inscriptionsQuery.data?.pages
            ?.map((page) => page?.results)
            .flat()
            .map((collection: InscriptionCollectionsData) => (
              <InscriptionsTabGridItem key={getCollectionKey(collection)} item={collection} />
            ))}
        </GridContainer>
        {inscriptionsQuery.hasNextPage && (
          <LoadMoreButtonContainer>
            <ActionButton
              transparent
              text={t('LOAD_MORE')}
              processing={inscriptionsQuery.isFetchingNextPage}
              disabled={inscriptionsQuery.isFetchingNextPage}
              onPress={onClickLoadMoreInscriptions}
            />
          </LoadMoreButtonContainer>
        )}
      </>
    );
  }, [inscriptionsQuery, isGalleryOpen, ordinalsLength, t]);

  const NftListView = useCallback(() => {
    const onClickLoadMoreStacksNfts = () => {
      stacksNftsQuery.fetchNextPage();
    };

    if (stacksNftsQuery.error && !(stacksNftsQuery.error instanceof InvalidParamsError)) {
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

    if (totalNfts === 0) {
      return <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>;
    }

    return (
      <>
        <GridContainer isGalleryOpen={isGalleryOpen}>
          {stacksNftsQuery.data?.pages
            ?.map((page) => page.nftsList)
            .flat()
            .map((nft) => (
              <Nft
                asset={nft}
                key={`${nft.asset_identifier}${nft.value.hex}`}
                isGalleryOpen={isGalleryOpen}
              />
            ))}
        </GridContainer>
        {stacksNftsQuery.hasNextPage && (
          <LoadMoreButtonContainer>
            <ActionButton
              transparent
              text={t('LOAD_MORE')}
              processing={stacksNftsQuery.isFetchingNextPage}
              disabled={stacksNftsQuery.isFetchingNextPage}
              onPress={stacksNftsQuery.fetchNextPage}
            />
          </LoadMoreButtonContainer>
        )}
      </>
    );
  }, [stacksNftsQuery, isGalleryOpen, totalNfts, t]);

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
    stacksNftsQuery,
    inscriptionsQuery,
    openInGalleryView,
    onReceiveModalOpen,
    onReceiveModalClose,
    onOrdinalReceiveAlertOpen,
    onOrdinalReceiveAlertClose,
    InscriptionListView,
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
    totalInscriptions: ordinalsLength,
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
    openInGalleryView,
    onReceiveModalOpen,
    onReceiveModalClose,
    onOrdinalReceiveAlertOpen,
    onOrdinalReceiveAlertClose,
    InscriptionListView,
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
        <StyledCollectiblesTabs
          nftListView={<NftListView />}
          inscriptionListView={<InscriptionListView />}
          nftDashboard={nftDashboard}
        />
      </Container>

      {!isGalleryOpen && <BottomTabBar tab="nft" />}
    </>
  );
}

export default NftDashboard;
