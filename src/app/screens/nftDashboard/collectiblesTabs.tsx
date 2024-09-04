import { StyledBarLoader, TilesSkeletonLoader } from '@components/tilesSkeletonLoader';
import WrenchErrorMessage from '@components/wrenchErrorMessage';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import { mapRareSatsAPIResponseToBundle, type Bundle } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledP, StyledTabList } from '@ui-library/common.styled';
import { TabItem } from '@ui-library/tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabPanel, Tabs } from 'react-tabs';
import styled from 'styled-components';
import Notice from './notice';
import RareSatsTabGridItem from './rareSatsTabGridItem';
import type { NftDashboardState } from './useNftDashboard';

const MAX_SATS_ITEMS_EXTENSION = 5;
const MAX_SATS_ITEMS_GALLERY = 20;

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

const RareSatsTabContainer = styled.div<{
  isGalleryOpen: boolean;
}>((props) => ({
  marginTop: props.theme.space.l,
}));

const StickyStyledTabList = styled(StyledTabList)`
  position: sticky;
  background: ${(props) => props.theme.colors.elevation0};
  top: -1px;
  z-index: 1;
  padding: ${(props) => props.theme.space.m} 0;
`;

const StyledTotalItems = styled(StyledP)`
  margin-top: ${(props) => props.theme.space.s};
`;

const NoticeContainer = styled.div((props) => ({
  marginTop: props.theme.space.m,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledWrenchErrorMessage = styled(WrenchErrorMessage)`
  margin-top: ${(props) => props.theme.space.xxl};
`;

const NoCollectiblesText = styled.div((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
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

type TabButton = {
  key: string;
  label: string;
};

const tabs: TabButton[] = [
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
    rareSatsQuery,
    totalNfts,
    totalInscriptions,
    hasActivatedRareSatsKey,
    hasActivatedOrdinalsKey,
    showNoticeAlert,
    onDismissRareSatsNotice,
    stacksNftsQuery,
    inscriptionsQuery,
  } = nftDashboard;

  useTrackMixPanelPageViewed(
    {
      tab: tabs[tabIndex]?.key,
    },
    [tabIndex],
  );

  const handleSelectTab = (index: number) => {
    setTabIndex(index);
  };

  useEffect(() => {
    setSearchParams({ tab: tabs[tabIndex]?.key });
  }, [tabIndex, setSearchParams]);

  const ordinalBundleCount = rareSatsQuery?.data?.pages?.[0]?.total || 0;
  const showNoBundlesNotice =
    ordinalBundleCount === 0 && !rareSatsQuery.isLoading && !rareSatsQuery.error;

  const visibleTabButtons = tabs.filter((tab: TabButton) => {
    if (tab.key === 'rareSats' && !hasActivatedRareSatsKey) {
      return false;
    }
    if (tab.key === 'inscriptions' && !hasActivatedOrdinalsKey) {
      return false;
    }
    return true;
  });

  return (
    <Tabs className={className} selectedIndex={tabIndex} onSelect={handleSelectTab}>
      {/* TODO: replace with Tabs component from `src/app/components/tabs/index.tsx` */}
      {visibleTabButtons.length > 1 && (
        <StickyStyledTabList data-testid="tab-list">
          {visibleTabButtons.map(({ key, label }) => (
            <TabItem
              key={key}
              $active={tabIndex === tabKeyToIndex(key)}
              onClick={() => handleSelectTab(tabKeyToIndex(key))}
            >
              {t(label)}
            </TabItem>
          ))}
        </StickyStyledTabList>
      )}
      {hasActivatedOrdinalsKey && (
        <TabPanel>
          {inscriptionsQuery.isInitialLoading ? (
            <SkeletonLoader isGalleryOpen={isGalleryOpen} />
          ) : (
            <>
              {totalInscriptions > 0 && (
                <StyledTotalItems
                  data-testid="total-items"
                  typography="body_medium_m"
                  color="white_200"
                >
                  {totalInscriptions === 1
                    ? t('TOTAL_ITEMS_ONE')
                    : t('TOTAL_ITEMS', { count: totalInscriptions })}
                </StyledTotalItems>
              )}
              {inscriptionListView}
            </>
          )}
        </TabPanel>
      )}
      <TabPanel>
        {stacksNftsQuery.isInitialLoading ? (
          <SkeletonLoader isGalleryOpen={isGalleryOpen} />
        ) : (
          <>
            {totalNfts > 0 && (
              <StyledTotalItems
                data-testid="total-items"
                typography="body_medium_m"
                color="white_200"
              >
                {totalNfts === 1 ? t('TOTAL_ITEMS_ONE') : t('TOTAL_ITEMS', { count: totalNfts })}
              </StyledTotalItems>
            )}
            {nftListView}
          </>
        )}
      </TabPanel>
      {hasActivatedRareSatsKey && (
        <TabPanel>
          {!rareSatsQuery.isLoading && ordinalBundleCount > 0 && (
            <StyledTotalItems
              data-testid="total-items"
              typography="body_medium_m"
              color="white_200"
            >
              {ordinalBundleCount === 1
                ? t('TOTAL_ITEMS_ONE')
                : t('TOTAL_ITEMS', { count: ordinalBundleCount })}
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
          {rareSatsQuery.isInitialLoading ? (
            <SkeletonLoader isGalleryOpen={isGalleryOpen} />
          ) : (
            <RareSatsTabContainer data-testid="rareSats-container" isGalleryOpen={isGalleryOpen}>
              {!rareSatsQuery.error &&
                !rareSatsQuery.isLoading &&
                rareSatsQuery.data?.pages
                  ?.map((page) => page?.results)
                  .flat()
                  .map((utxo) => mapRareSatsAPIResponseToBundle(utxo))
                  .map((bundle: Bundle) => (
                    <RareSatsTabGridItem
                      key={bundle.txid}
                      bundle={bundle}
                      maxItems={isGalleryOpen ? MAX_SATS_ITEMS_GALLERY : MAX_SATS_ITEMS_EXTENSION}
                    />
                  ))}
            </RareSatsTabContainer>
          )}
          {rareSatsQuery.hasNextPage && (
            <LoadMoreButtonContainer>
              <Button
                variant="secondary"
                title={t('LOAD_MORE')}
                loading={rareSatsQuery.isFetchingNextPage}
                disabled={rareSatsQuery.isFetchingNextPage}
                onClick={() => rareSatsQuery.fetchNextPage()}
              />
            </LoadMoreButtonContainer>
          )}
        </TabPanel>
      )}
    </Tabs>
  );
}
