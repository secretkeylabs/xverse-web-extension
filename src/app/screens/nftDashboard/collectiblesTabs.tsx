import ActionButton from '@components/button';
import WrenchErrorMessage from '@components/wrenchErrorMessage';
import { StyledP, StyledTab, StyledTabList } from '@ui-library/common.styled';
import { ApiBundle, Bundle, mapRareSatsAPIResponseToRareSats } from '@utils/rareSats';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabPanel, Tabs } from 'react-tabs';
import styled from 'styled-components';
import type { NftDashboardState } from '.';
import { StyledBarLoader, TilesSkeletonLoader } from '../../components/tilesSkeletonLoader';
import Notice from './notice';
import RareSatsTabGridItem from './rareSatsTabGridItem';

export const GridContainer = styled.div<{
  isGalleryOpen: boolean;
}>((props) => ({
  display: 'grid',
  columnGap: props.isGalleryOpen ? props.theme.space.xl : props.theme.space.m,
  rowGap: props.isGalleryOpen ? props.theme.space.xl : props.theme.space.l,
  marginTop: props.theme.space.l,
  gridTemplateColumns: props.isGalleryOpen
    ? 'repeat(auto-fill,minmax(220px,1fr))'
    : 'repeat(auto-fill,minmax(150px,1fr))',
}));

const StyledTotalItems = styled(StyledP)`
  margin-top: ${(props) => props.theme.space.s};
`;

const NoticeContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledWrenchErrorMessage = styled(WrenchErrorMessage)`
  margin-top: ${(props) => props.theme.space.xxl};
`;

const NoCollectiblesText = styled.div((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(16),
  textAlign: 'center',
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

const LoaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const CountLoaderContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(6),
  marginBottom: props.theme.spacing(12),
}));

function SkeletonLoader({ isGalleryOpen }: { isGalleryOpen: boolean }) {
  return (
    <LoaderContainer>
      <CountLoaderContainer>
        <StyledBarLoader width={85} height={20} />
      </CountLoaderContainer>
      <TilesSkeletonLoader isGalleryOpen={isGalleryOpen} tileSize={isGalleryOpen ? 276 : 151} />
    </LoaderContainer>
  );
}

const tabs: {
  key: string;
  label: string;
}[] = [
  {
    key: 'inscriptions',
    label: 'INSCRIPTIONS',
  },
  {
    key: 'nfts',
    label: 'NFTS',
  },
  {
    key: 'rareSats',
    label: 'RARE_SATS',
  },
];

const tabKeyToIndex = (key?: string | null) => {
  if (!key) return 0;
  return tabs.findIndex((tab) => tab.key === key);
};

export default function CollectiblesTabs({
  className,
  nftListView,
  inscriptionListView,
  nftDashboard,
}: {
  className?: string;
  nftListView: React.ReactNode;
  inscriptionListView: React.ReactNode;
  nftDashboard: NftDashboardState;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabIndex, setTabIndex] = useState(tabKeyToIndex(searchParams?.get('tab')));
  const {
    isGalleryOpen,
    hasActivatedOrdinalsKey,
    rareSatsQuery,
    totalNfts,
    totalInscriptions,
    hasActivatedRareSatsKey,
    showNoticeAlert,
    onDismissRareSatsNotice,
    onLoadMoreRareSatsButtonClick,
    isLoading,
    isLoadingOrdinalCollections,
  } = nftDashboard;

  const handleSelectTab = (index: number) => {
    setTabIndex(index);
  };

  useEffect(() => {
    setSearchParams({ tab: tabs[tabIndex]?.key });
  }, [tabIndex, setSearchParams]);

  const ordinalBundleCount = rareSatsQuery?.data?.pages?.[0]?.total || 0;
  const showNoBundlesNotice =
    ordinalBundleCount === 0 && !rareSatsQuery.isLoading && !rareSatsQuery.error;

  return (
    <Tabs className={className} selectedIndex={tabIndex} onSelect={handleSelectTab}>
      {hasActivatedRareSatsKey && (
        <StyledTabList>
          {tabs.map(({ key, label }) => (
            <StyledTab key={key}>{t(label)}</StyledTab>
          ))}
        </StyledTabList>
      )}
      <TabPanel>
        {isLoadingOrdinalCollections ? (
          <SkeletonLoader isGalleryOpen={isGalleryOpen} />
        ) : (
          <>
            {totalInscriptions > 0 && (
              <StyledTotalItems typography="body_medium_m" color="white_200">
                {t('TOTAL_ITEMS', { total: totalInscriptions || 0 })}
              </StyledTotalItems>
            )}
            {inscriptionListView}
          </>
        )}
      </TabPanel>
      <TabPanel>
        {isLoading ? (
          <SkeletonLoader isGalleryOpen={isGalleryOpen} />
        ) : (
          <>
            {totalNfts > 0 && (
              <StyledTotalItems typography="body_medium_m" color="white_200">
                {t('TOTAL_ITEMS', { total: totalNfts || 0 })}
              </StyledTotalItems>
            )}
            {nftListView}
          </>
        )}
      </TabPanel>
      <TabPanel>
        {!rareSatsQuery.isLoading && ordinalBundleCount > 0 && (
          <StyledTotalItems typography="body_medium_m" color="white_200">
            {t('TOTAL_ITEMS', { total: ordinalBundleCount })}
          </StyledTotalItems>
        )}

        {!rareSatsQuery.isLoading && showNoticeAlert && (
          <NoticeContainer>
            <Notice
              title={t('RARE_SATS_NOTICE_TITLE')}
              description={t('RARE_SATS_NOTICE_DETAIL')}
              onClose={() => {
                onDismissRareSatsNotice();
              }}
              seeRarities={() => {
                navigate('supported-rarity-scale');
              }}
            />
          </NoticeContainer>
        )}
        {showNoBundlesNotice && <NoCollectiblesText>{t('NO_COLLECTIBLES')}</NoCollectiblesText>}

        {!!rareSatsQuery.error && <StyledWrenchErrorMessage />}
        {rareSatsQuery.isLoading ? (
          <SkeletonLoader isGalleryOpen={isGalleryOpen} />
        ) : (
          <GridContainer isGalleryOpen={isGalleryOpen}>
            {hasActivatedOrdinalsKey &&
              !rareSatsQuery.error &&
              !rareSatsQuery.isLoading &&
              rareSatsQuery.data?.pages
                ?.map((page) => page?.results)
                .flat()
                .map((utxo: ApiBundle) => mapRareSatsAPIResponseToRareSats(utxo))
                .map((bundle: Bundle) => <RareSatsTabGridItem key={bundle.txid} bundle={bundle} />)}
          </GridContainer>
        )}
        {rareSatsQuery.hasNextPage && (
          <LoadMoreButtonContainer>
            <ActionButton
              transparent
              text={t('LOAD_MORE')}
              processing={rareSatsQuery.isFetchingNextPage}
              disabled={rareSatsQuery.isFetchingNextPage}
              onPress={onLoadMoreRareSatsButtonClick}
            />
          </LoadMoreButtonContainer>
        )}
      </TabPanel>
    </Tabs>
  );
}
