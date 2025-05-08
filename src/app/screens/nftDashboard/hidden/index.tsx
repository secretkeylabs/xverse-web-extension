import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { TrayArrowUp } from '@phosphor-icons/react';
import {
  removeAllFromHideCollectiblesAction,
  setHiddenCollectiblesAction,
} from '@stores/wallet/actions/actionCreators';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import SnackBar from '@ui-library/snackBar';
import { TabItem } from '@ui-library/tabs';
import { LONG_TOAST_DURATION } from '@utils/constants';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabPanel, Tabs } from 'react-tabs';
import styled from 'styled-components';
import Theme from 'theme';
import {
  CollectiblesContainer,
  StickyStyledTabList,
  StyledSheetButton,
} from '../collectiblesTabs/index.styled';
import SkeletonLoader from '../collectiblesTabs/skeletonLoader';
import useNftDashboard from '../useNftDashboard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  ${(props) => props.theme.scrollbar}
`;

const PageHeader = styled.div`
  padding: ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.l};
  border-bottom: 0.5px solid ${(props) => props.theme.colors.elevation3};
  max-width: 1224px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

const RowCenterSpaceBetween = styled.div<{ addMarginBottom?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(props) => (props.addMarginBottom ? props.theme.space.m : 0)};
`;

const ItemCountContainer = styled.div`
  margin-top: ${(props) => props.theme.space.m};
`;

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
];

const tabKeyToIndex = (visibleTabButtons: TabButton[], key?: string | null) => {
  if (!key) return 0;
  return visibleTabButtons.findIndex((tab) => tab.key === key);
};

function NftDashboardHidden() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const [searchParams] = useSearchParams();
  const tab = searchParams?.get('tab');
  const {
    isGalleryOpen,
    hiddenInscriptionsQuery,
    totalHiddenInscriptions,
    HiddenInscriptionListView,
    hiddenStacksNftsQuery,
    totalHiddenNfts,
    HiddenNftListView,
    hasActivatedOrdinalsKey,
  } = useNftDashboard();
  const { ordinalsAddress, stxAddress } = useSelectedAccount();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hiddenCollectibleIds } = useWalletSelector();
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const visibleTabButtons = tabs.filter((tabItem: TabButton) => {
    if (tabItem.key === 'inscriptions' && !hasActivatedOrdinalsKey) {
      return false;
    }
    return true;
  });
  const [tabIndex, setTabIndex] = useState(tabKeyToIndex(visibleTabButtons, tab));

  const handleBackButtonClick = () => {
    navigate(`/nft-dashboard?tab=${tab}`);
  };

  const handleClickUndoHidingAll = ({
    toastId,
    currentInscriptionsHidden,
    currentStacksNftsHidden,
  }: {
    toastId: string;
    currentInscriptionsHidden: Record<string, string>;
    currentStacksNftsHidden: Record<string, string>;
  }) => {
    dispatch(
      setHiddenCollectiblesAction({
        collectibleIds: {
          [ordinalsAddress]: currentInscriptionsHidden,
          [stxAddress]: currentStacksNftsHidden,
        },
      }),
    );
    toast.remove(toastId);
    toast(t('ITEMS_RETURNED_TO_HIDDEN'), {
      duration: LONG_TOAST_DURATION,
    });
  };

  const handleUnHideAll = () => {
    const currentInscriptionsHidden = {
      ...(hiddenCollectibleIds[ordinalsAddress] ?? {}),
    };
    const currentStacksNftsHidden = {
      ...(hiddenCollectibleIds[stxAddress] ?? {}),
    };

    dispatch(removeAllFromHideCollectiblesAction({ address: ordinalsAddress }));
    dispatch(removeAllFromHideCollectiblesAction({ address: stxAddress }));
    handleBackButtonClick();

    const toastId = toast(
      <SnackBar
        text={t('HIDDEN_ITEMS_RESTORED')}
        type="neutral"
        action={{
          text: tCommon('UNDO'),
          onClick: () =>
            handleClickUndoHidingAll({
              toastId,
              currentInscriptionsHidden,
              currentStacksNftsHidden,
            }),
        }}
      />,
      { duration: LONG_TOAST_DURATION },
    );
  };

  const handleSelectTab = (index: number) => setTabIndex(index);

  const openOptionsDialog = () => {
    setIsOptionsModalVisible(true);
  };

  const closeOptionsDialog = () => {
    setIsOptionsModalVisible(false);
  };

  return (
    <>
      <TopRow
        onClick={handleBackButtonClick}
        onMenuClick={
          totalHiddenInscriptions > 0 || totalHiddenNfts > 0 ? openOptionsDialog : undefined
        }
      />
      <Container>
        <PageHeader>
          <RowCenterSpaceBetween addMarginBottom={isGalleryOpen}>
            <StyledHeading typography={isGalleryOpen ? 'headline_xl' : 'headline_s'}>
              {t('HIDDEN_COLLECTIBLES')}
            </StyledHeading>
          </RowCenterSpaceBetween>
        </PageHeader>
        <CollectiblesContainer>
          {/* TODO: replace with Tabs component from `src/app/ui-library/tabs.tsx` */}
          <Tabs selectedIndex={tabIndex} onSelect={handleSelectTab}>
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
                <div>
                  <div>
                    {hiddenInscriptionsQuery.isLoading ? (
                      <SkeletonLoader isGalleryOpen={isGalleryOpen} />
                    ) : (
                      <>
                        <ItemCountContainer>
                          {totalHiddenInscriptions > 0 ? (
                            <StyledP
                              data-testid="total-items"
                              typography="body_medium_m"
                              color="white_200"
                            >
                              {totalHiddenInscriptions === 1
                                ? t('TOTAL_ITEMS_ONE')
                                : t('TOTAL_ITEMS', { count: totalHiddenInscriptions })}
                            </StyledP>
                          ) : (
                            <div />
                          )}
                        </ItemCountContainer>
                        <HiddenInscriptionListView />
                      </>
                    )}
                  </div>
                </div>
              </TabPanel>
            )}
            <TabPanel>
              {hiddenStacksNftsQuery.isLoading ? (
                <SkeletonLoader isGalleryOpen={isGalleryOpen} />
              ) : (
                <>
                  <ItemCountContainer>
                    {totalHiddenNfts > 0 ? (
                      <StyledP
                        data-testid="total-items"
                        typography="body_medium_m"
                        color="white_200"
                      >
                        {totalHiddenNfts === 1
                          ? t('TOTAL_ITEMS_ONE')
                          : t('TOTAL_ITEMS', { count: totalHiddenNfts })}
                      </StyledP>
                    ) : (
                      <div />
                    )}
                  </ItemCountContainer>
                  <HiddenNftListView />
                </>
              )}
            </TabPanel>
          </Tabs>
        </CollectiblesContainer>
      </Container>
      <BottomTabBar tab="nft" />
      {isOptionsModalVisible && (
        <Sheet
          title={tCommon('OPTIONS')}
          visible={isOptionsModalVisible}
          onClose={closeOptionsDialog}
        >
          <StyledSheetButton
            variant="tertiary"
            icon={<TrayArrowUp size={24} color={Theme.colors.white_200} />}
            title={t('UNHIDE_ALL')}
            onClick={handleUnHideAll}
          />
        </Sheet>
      )}
    </>
  );
}

export default NftDashboardHidden;
