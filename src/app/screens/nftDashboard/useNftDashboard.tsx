import useAddressInscriptions from '@hooks/queries/ordinals/useAddressInscriptions';
import { useAddressRareSats } from '@hooks/queries/ordinals/useAddressRareSats';
import useStacksCollectibles from '@hooks/queries/useStacksCollectibles';
import useWalletSelector from '@hooks/useWalletSelector';
import { Wrench } from '@phosphor-icons/react';
import type { InscriptionCollectionsData, StacksCollectionData } from '@secretkeylabs/xverse-core';
import { SetRareSatsNoticeDismissedAction } from '@stores/wallet/actions/actionCreators';
import Button from '@ui-library/button';
import { POPUP_WIDTH } from '@utils/constants';
import { getCollectionKey } from '@utils/inscriptions';
import { InvalidParamsError } from '@utils/query';
import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsVisible } from 'react-is-visible';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { GridContainer } from './collectiblesTabs/index.styled';
import InscriptionsTabGridItem from './inscriptionsTabGridItem';
import NftTabGridItem from './nftTabGridItem';

const NoCollectiblesText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.xl,
  marginBottom: 'auto',
  textAlign: 'center',
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.space.xxl,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const ErrorTextContainer = styled.div((props) => ({
  marginTop: props.theme.space.m,
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
  stacksNftsQuery: ReturnType<typeof useStacksCollectibles>;
  inscriptionsQuery: ReturnType<typeof useAddressInscriptions>;
  hiddenInscriptionsQuery: ReturnType<typeof useAddressInscriptions>;
  hiddenStacksNftsQuery: ReturnType<typeof useStacksCollectibles>;
  rareSatsQuery: ReturnType<typeof useAddressRareSats>;
  openInGalleryView: () => void;
  onReceiveModalOpen: () => void;
  onReceiveModalClose: () => void;
  InscriptionListView: () => JSX.Element;
  HiddenInscriptionListView: () => JSX.Element;
  NftListView: () => JSX.Element;
  HiddenNftListView: () => JSX.Element;
  onDismissRareSatsNotice: () => void;
  isGalleryOpen: boolean;
  hasActivatedOrdinalsKey?: boolean;
  hasActivatedRareSatsKey?: boolean;
  showNoticeAlert?: boolean;
  totalNfts: number;
  totalHiddenNfts: number;
  totalInscriptions: number;
  totalHiddenInscriptions: number;
};

const useNftDashboard = (): NftDashboardState => {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const dispatch = useDispatch();
  const { hasActivatedOrdinalsKey, hasActivatedRareSatsKey, rareSatsNoticeDismissed } =
    useWalletSelector();
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [showNoticeAlert, setShowNoticeAlert] = useState(false);
  const stacksNftsQuery = useStacksCollectibles();
  const hiddenStacksNftsQuery = useStacksCollectibles(true);
  const inscriptionsQuery = useAddressInscriptions();
  const hiddenInscriptionsQuery = useAddressInscriptions(true);
  const rareSatsQuery = useAddressRareSats();

  const totalInscriptions = inscriptionsQuery.data?.pages?.[0]?.total_inscriptions ?? 0;
  const totalHiddenInscriptions = hiddenInscriptionsQuery.data?.pages?.[0]?.total_inscriptions ?? 0;

  const totalNfts = stacksNftsQuery.data?.total_nfts ?? 0;
  const totalHiddenNfts = hiddenStacksNftsQuery.data?.total_nfts ?? 0;

  const isGalleryOpen: boolean = useMemo(
    () => document.documentElement.clientWidth > POPUP_WIDTH,
    [],
  );

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
        <GridContainer $isGalleryOpen={isGalleryOpen}>
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

  const HiddenInscriptionListView = useCallback(() => {
    if (
      hiddenInscriptionsQuery.error &&
      !(hiddenInscriptionsQuery.error instanceof InvalidParamsError)
    ) {
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

    if (totalHiddenInscriptions === 0) {
      return <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>;
    }

    return (
      <>
        <GridContainer $isGalleryOpen={isGalleryOpen}>
          {hiddenInscriptionsQuery.data?.pages
            ?.map((page) => page?.results)
            .flat()
            .map((collection: InscriptionCollectionsData) => (
              <InscriptionsTabGridItem key={getCollectionKey(collection)} item={collection} />
            ))}
        </GridContainer>
        {hiddenInscriptionsQuery.hasNextPage && (
          <LoadMoreButtonContainer>
            <Button
              variant="secondary"
              title={t('LOAD_MORE')}
              loading={hiddenInscriptionsQuery.isFetchingNextPage}
              disabled={hiddenInscriptionsQuery.isFetchingNextPage}
              onClick={() => hiddenInscriptionsQuery.fetchNextPage()}
            />
          </LoadMoreButtonContainer>
        )}
      </>
    );
  }, [hiddenInscriptionsQuery, isGalleryOpen, totalHiddenInscriptions, t]);

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
      <GridContainer $isGalleryOpen={isGalleryOpen}>
        {stacksNftsQuery.data?.results.map((collection: StacksCollectionData) => (
          <IsVisibleOrPlaceholder key={collection.collection_id}>
            <NftTabGridItem item={collection} />
          </IsVisibleOrPlaceholder>
        ))}
      </GridContainer>
    );
  }, [stacksNftsQuery, isGalleryOpen, totalNfts, t]);

  const HiddenNftListView = useCallback(() => {
    if (
      hiddenStacksNftsQuery.error &&
      !(hiddenStacksNftsQuery.error instanceof InvalidParamsError)
    ) {
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

    if (totalHiddenNfts === 0) {
      return <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>;
    }

    return (
      <GridContainer $isGalleryOpen={isGalleryOpen}>
        {hiddenStacksNftsQuery.data?.results.map((collection: StacksCollectionData) => (
          <IsVisibleOrPlaceholder key={collection.collection_id}>
            <NftTabGridItem item={collection} />
          </IsVisibleOrPlaceholder>
        ))}
      </GridContainer>
    );
  }, [hiddenStacksNftsQuery, isGalleryOpen, totalHiddenNfts, t]);

  const onDismissRareSatsNotice = () => {
    setShowNoticeAlert(false);
    dispatch(SetRareSatsNoticeDismissedAction(true));
  };

  return {
    openReceiveModal,
    stacksNftsQuery,
    hiddenStacksNftsQuery,
    inscriptionsQuery,
    hiddenInscriptionsQuery,
    openInGalleryView,
    onReceiveModalOpen,
    onReceiveModalClose,
    InscriptionListView,
    HiddenInscriptionListView,
    NftListView,
    HiddenNftListView,
    onDismissRareSatsNotice,
    isGalleryOpen,
    hasActivatedOrdinalsKey,
    hasActivatedRareSatsKey,
    showNoticeAlert,
    rareSatsQuery,
    totalNfts,
    totalHiddenNfts,
    totalInscriptions,
    totalHiddenInscriptions,
  };
};

export default useNftDashboard;
