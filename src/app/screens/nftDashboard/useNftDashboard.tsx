import useAddressInscriptionCollections from '@hooks/queries/ordinals/useAddressInscriptionCollections';
import { useAddressRareSats } from '@hooks/queries/ordinals/useAddressRareSats';
import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useWalletSelector from '@hooks/useWalletSelector';
import { Wrench } from '@phosphor-icons/react';
import type { InscriptionCollectionsData, StacksCollectionData } from '@secretkeylabs/xverse-core';
import {
  ChangeActivateOrdinalsAction,
  ChangeActivateRareSatsAction,
  SetRareSatsNoticeDismissedAction,
} from '@stores/wallet/actions/actionCreators';
import Button from '@ui-library/button';
import { getCollectionKey } from '@utils/inscriptions';
import { InvalidParamsError } from '@utils/query';
import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsVisible } from 'react-is-visible';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { GridContainer } from './collectiblesTabs';
import InscriptionsTabGridItem from './inscriptionsTabGridItem';
import NftTabGridItem from './nftTabGridItem';

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

function IsVisibleOrPlaceholder({ children }: PropsWithChildren) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(nodeRef, { once: false });

  return (
    <div ref={nodeRef}>
      {isVisible ? children : <NftTabGridItem isLoading item={{} as StacksCollectionData} />}
    </div>
  );
}

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
};

const useNftDashboard = (): NftDashboardState => {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const dispatch = useDispatch();
  const { hasActivatedOrdinalsKey, hasActivatedRareSatsKey, rareSatsNoticeDismissed } =
    useWalletSelector();
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [showNewFeatureAlert, setShowNewFeatureAlert] = useState(false);
  const [showNoticeAlert, setShowNoticeAlert] = useState(false);
  const [isOrdinalReceiveAlertVisible, setIsOrdinalReceiveAlertVisible] = useState(false);
  const stacksNftsQuery = useStacksCollectibles();
  const inscriptionsQuery = useAddressInscriptionCollections();
  const rareSatsQuery = useAddressRareSats();

  const totalInscriptions = inscriptionsQuery.data?.pages?.[0]?.total_inscriptions ?? 0;
  const totalNfts = stacksNftsQuery.data?.total_nfts ?? 0;

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  useEffect(() => {
    if (
      (hasActivatedOrdinalsKey === undefined && totalInscriptions) ||
      hasActivatedRareSatsKey === undefined
    ) {
      setShowNewFeatureAlert(true);
    }
  }, [hasActivatedOrdinalsKey, hasActivatedRareSatsKey, totalInscriptions]);

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

    if (totalInscriptions === 0) {
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
            <Button
              variant="secondary"
              title={t('LOAD_MORE')}
              loading={inscriptionsQuery.isFetchingNextPage}
              disabled={inscriptionsQuery.isFetchingNextPage}
              onClick={() => inscriptionsQuery.fetchNextPage()}
            />
          </LoadMoreButtonContainer>
        )}
      </>
    );
  }, [inscriptionsQuery, isGalleryOpen, totalInscriptions, t]);

  const NftListView = useCallback(() => {
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
      <GridContainer isGalleryOpen={isGalleryOpen}>
        {stacksNftsQuery.data?.results.map((collection: StacksCollectionData) => (
          <IsVisibleOrPlaceholder key={collection.collection_id}>
            <NftTabGridItem item={collection} />
          </IsVisibleOrPlaceholder>
        ))}
      </GridContainer>
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
    totalInscriptions,
  };
};

export default useNftDashboard;
