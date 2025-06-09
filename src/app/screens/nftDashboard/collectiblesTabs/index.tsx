import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import { TrayArrowDown } from '@phosphor-icons/react';
import { mapRareSatsAPIResponseToBundle, type Bundle } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import { TabItem } from '@ui-library/tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabPanel, Tabs } from 'react-tabs';
import Theme from 'theme';
import Notice from '../notice';
import RareSatsTabGridItem from '../rareSatsTabGridItem';
import type { NftDashboardState } from '../useNftDashboard';

import {
  LoadMoreButtonContainer,
  NoCollectiblesText,
  NoticeContainer,
  RareSatsTabContainer,
  StickyStyledTabList,
  StyledButton,
  StyledTotalItems,
  StyledWrenchErrorMessage,
  TopBarContainer,
} from './index.styled';
import SkeletonLoader from './skeletonLoader';

const MAX_SATS_ITEMS_EXTENSION = 5;
const MAX_SATS_ITEMS_GALLERY = 20;

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

const tabKeyToIndex = (visibleTabButtons: TabButton[], key?: string | null) => {
  if (!key) return 0;
  return visibleTabButtons.findIndex((tab) => tab.key === key);
};

type Props = {
  className?: string;
  nftListView: React.ReactNode;
  inscriptionListView: React.ReactNode;
  nftDashboard: NftDashboardState;
};

export default function CollectiblesTabs({
  className,
  nftListView,
  inscriptionListView,
  nftDashboard,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const visibleTabButtons = tabs.filter((tab: TabButton) => {
    if (tab.key === 'rareSats' && !hasActivatedRareSatsKey) {
      return false;
    }
    if (tab.key === 'inscriptions' && !hasActivatedOrdinalsKey) {
      return false;
    }
    return true;
  });
  const [tabIndex, setTabIndex] = useState(
    tabKeyToIndex(visibleTabButtons, searchParams?.get('tab')),
  );

  useTrackMixPanelPageViewed(
    {
      tab: tabs[tabIndex]?.key,
    },
    [tabIndex],
  );

  const handleSelectTab = (index: number) => setTabIndex(index);

  useEffect(() => {
    setSearchParams({ tab: tabs[tabIndex]?.key });
  }, [tabIndex]);

  const ordinalBundleCount = rareSatsQuery?.data?.pages?.[0]?.total || 0;
  const showNoBundlesNotice =
    ordinalBundleCount === 0 && !rareSatsQuery.isLoading && !rareSatsQuery.error;

  return (
    <Tabs className={className} selectedIndex={tabIndex} onSelect={handleSelectTab}>
      {/* TODO: replace with Tabs component from `src/app/ui-library/tabs.tsx` */}
      {visibleTabButtons.length > 1 && (
        <StickyStyledTabList data-testid="tab-list">
          {visibleTabButtons.map(({ key, label }) => (
            <TabItem
              key={key}
              $active={tabIndex === tabKeyToIndex(visibleTabButtons, key)}
              onClick={() => handleSelectTab(tabKeyToIndex(visibleTabButtons, key))}
            >
              {t(label)}
            </TabItem>
          ))}
        </StickyStyledTabList>
      )}
      {hasActivatedOrdinalsKey && (
        <TabPanel>
          {inscriptionsQuery.isLoading ? (
            <SkeletonLoader isGalleryOpen={isGalleryOpen} />
          ) : (
            <>
              <TopBarContainer>
                {totalInscriptions > 0 ? (
                  <StyledP data-testid="total-items" typography="body_medium_m" color="white_200">
                    {totalInscriptions === 1
                      ? t('TOTAL_ITEMS_ONE')
                      : t('TOTAL_ITEMS', { count: totalInscriptions })}
                  </StyledP>
                ) : (
                  <div />
                )}
                <StyledButton
                  variant="tertiary"
                  icon={<TrayArrowDown size={20} color={Theme.colors.white_200} />}
                  title={t('HIDDEN_COLLECTIBLES')}
                  onClick={() => {
                    navigate(`/nft-dashboard/hidden?tab=${tabs[tabIndex]?.key}`);
                  }}
                />
              </TopBarContainer>
              {inscriptionListView}
            </>
          )}
        </TabPanel>
      )}
      <TabPanel>
        {stacksNftsQuery.isLoading ? (
          <SkeletonLoader isGalleryOpen={isGalleryOpen} />
        ) : (
          <>
            {totalNfts > 0 && (
              <TopBarContainer>
                <StyledP data-testid="total-items" typography="body_medium_m" color="white_200">
                  {totalNfts === 1 ? t('TOTAL_ITEMS_ONE') : t('TOTAL_ITEMS', { count: totalNfts })}
                </StyledP>
                <StyledButton
                  variant="tertiary"
                  icon={<TrayArrowDown size={20} color={Theme.colors.white_200} />}
                  title={t('HIDDEN_COLLECTIBLES')}
                  onClick={() => {
                    navigate('/nft-dashboard/hidden?tab=nfts');
                  }}
                />
              </TopBarContainer>
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
          {rareSatsQuery.isLoading ? (
            <SkeletonLoader isGalleryOpen={isGalleryOpen} />
          ) : (
            <RareSatsTabContainer data-testid="rareSats-container">
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
