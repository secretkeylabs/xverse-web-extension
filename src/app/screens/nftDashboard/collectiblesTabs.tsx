import { Wrench } from '@phosphor-icons/react';
import { StyledP, StyledTab, StyledTabList } from '@ui-library/common.styled';
import { ApiBundle, Bundle, mapRareSatsAPIResponseToRareSats } from '@utils/rareSats';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabPanel, Tabs } from 'react-tabs';
import styled from 'styled-components';
import { MoonLoader } from 'react-spinners';
import type { NftDashboardState } from '.';
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

const NoCollectiblesText = styled.div((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(16),
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

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

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

const tabNameToIndex = {
  inscriptions: 0,
  rareSats: 1,
};

const tabIndexToName = {
  0: 'inscriptions',
  1: 'rareSats',
};

export default function CollectiblesTabs({
  className,
  nftListView,
  nftDashboard,
}: {
  className?: string;
  nftListView: React.ReactNode;
  nftDashboard: NftDashboardState;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabIndex, setTabIndex] = useState(tabNameToIndex[searchParams?.get('tab') ?? ''] ?? 0);
  const {
    isGalleryOpen,
    hasActivatedOrdinalsKey,
    rareSatsQuery,
    totalNfts,
    hasActivatedRareSatsKey,
    showNoticeAlert,
    onDismissRareSatsNotice,
    onLoadMoreRareSatsButtonClick,
  } = nftDashboard;

  const handleSelectTab = (index: number) => {
    setTabIndex(index);
  };

  useEffect(() => {
    setSearchParams({ tab: tabIndexToName[tabIndex] });
  }, [tabIndex, setSearchParams]);

  const ordinalBundleCount = rareSatsQuery?.data?.pages?.[0]?.total || 0;
  const showNoBundlesNotice =
    ordinalBundleCount === 0 && !rareSatsQuery.isLoading && !rareSatsQuery.error;

  return (
    <Tabs className={className} selectedIndex={tabIndex} onSelect={handleSelectTab}>
      {hasActivatedRareSatsKey && (
        <StyledTabList>
          <StyledTab>{t('NFTS')}</StyledTab>
          <StyledTab>{t('RARE_SATS')}</StyledTab>
        </StyledTabList>
      )}
      <TabPanel>
        {totalNfts > 0 && (
          <StyledTotalItems typography="body_medium_m" color="white_200">
            {t('TOTAL_ITEMS', { total: totalNfts || 0 })}
          </StyledTotalItems>
        )}
        {nftListView}
      </TabPanel>
      <TabPanel>
        {ordinalBundleCount > 0 && (
          <StyledTotalItems typography="body_medium_m" color="white_200">
            {t('TOTAL_ITEMS', { total: ordinalBundleCount })}
          </StyledTotalItems>
        )}

        {showNoticeAlert && (
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

        {!!rareSatsQuery.error && (
          <ErrorContainer>
            <Wrench size={48} />
            <ErrorTextContainer>
              <ErrorText>{t('ERROR_RETRIEVING')}</ErrorText>
              <ErrorText>{t('TRY_AGAIN')}</ErrorText>
            </ErrorTextContainer>
          </ErrorContainer>
        )}
        {rareSatsQuery.isLoading && (
          <LoaderContainer>
            <MoonLoader color="white" size={30} />
          </LoaderContainer>
        )}
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
        {rareSatsQuery.hasNextPage && (
          <LoadMoreButtonContainer>
            {rareSatsQuery.isFetchingNextPage ? (
              <MoonLoader color="white" size={30} />
            ) : (
              <LoadMoreButton onClick={onLoadMoreRareSatsButtonClick}>
                {t('LOAD_MORE')}
              </LoadMoreButton>
            )}
          </LoadMoreButtonContainer>
        )}
      </TabPanel>
    </Tabs>
  );
}
