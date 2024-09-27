import AccountHeaderComponent from '@components/accountHeader';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { ArrowLeft, TrayArrowUp } from '@phosphor-icons/react';
import { removeAllFromHideCollectiblesAction } from '@stores/wallet/actions/actionCreators';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabPanel, Tabs } from 'react-tabs';
import styled from 'styled-components';
import Theme from '../../../../theme';
import { StyledButton } from '../collectiblesTabs/index.styled';
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

const CollectiblesContainer = styled.div`
  padding: 0 ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.xl};
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

const BackButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${(props) => props.theme.space.xxs};
  background: transparent;
  margin-bottom: ${(props) => props.theme.space.xl};
  color: ${(props) => props.theme.colors.white_0};
`;

const ItemCountContainer = styled.div<{ isGalleryOpen: boolean }>`
  margin-top: ${(props) => (props.isGalleryOpen ? props.theme.space.l : props.theme.space.m)};
`;

function Index() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const { t: tCollectibles } = useTranslation('translation', {
    keyPrefix: 'COLLECTIBLE_COLLECTION_SCREEN',
  });
  const [searchParams] = useSearchParams();
  const tab = searchParams?.get('tab');
  const nftDashboard = useNftDashboard();
  const { ordinalsAddress } = useSelectedAccount();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    isGalleryOpen,
    hiddenInscriptionsQuery,
    totalHiddenInscriptions,
    HiddenInscriptionListView,
  } = nftDashboard;

  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);

  const handleBackButtonClick = () => {
    navigate(`/nft-dashboard?tab=${tab}`);
  };

  const handleUnHideAll = () => {
    dispatch(removeAllFromHideCollectiblesAction({ address: ordinalsAddress }));
    handleBackButtonClick();
  };

  const openOptionsDialog = () => {
    setIsOptionsModalVisible(true);
  };

  const closeOptionsDialog = () => {
    setIsOptionsModalVisible(false);
  };

  return (
    <>
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} showBorderBottom={false} />
      ) : (
        <TopRow
          onClick={handleBackButtonClick}
          onMenuClick={totalHiddenInscriptions > 0 ? openOptionsDialog : undefined}
        />
      )}
      <Container>
        <PageHeader>
          {isGalleryOpen && (
            <BackButton onClick={handleBackButtonClick}>
              <ArrowLeft size={16} color="currentColor" />
              <StyledP data-testid="back-to-gallery" typography="body_m" color="white_0">
                {tCollectibles('BACK_TO_GALLERY')}
              </StyledP>
            </BackButton>
          )}
          <RowCenterSpaceBetween addMarginBottom={isGalleryOpen}>
            <StyledHeading typography={isGalleryOpen ? 'headline_xl' : 'headline_s'}>
              {t('HIDDEN_COLLECTIBLES')}
            </StyledHeading>
            {isGalleryOpen && totalHiddenInscriptions > 0 ? (
              <StyledButton
                variant="tertiary"
                icon={<TrayArrowUp size={20} color={Theme.colors.white_200} />}
                title={t('UNHIDE_ALL')}
                onClick={handleUnHideAll}
              />
            ) : null}
          </RowCenterSpaceBetween>
        </PageHeader>
        <CollectiblesContainer>
          <Tabs>
            {/* TODO: add tab selector once we support nft */}
            <TabPanel>
              <div>
                <div>
                  {hiddenInscriptionsQuery.isInitialLoading ? (
                    <SkeletonLoader isGalleryOpen={isGalleryOpen} />
                  ) : (
                    <>
                      <ItemCountContainer isGalleryOpen={isGalleryOpen}>
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
          </Tabs>
        </CollectiblesContainer>
      </Container>
      {!isGalleryOpen && <BottomTabBar tab="nft" />}
      {isOptionsModalVisible && (
        <Sheet
          title={tCommon('OPTIONS')}
          visible={isOptionsModalVisible}
          onClose={closeOptionsDialog}
        >
          <StyledButton
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
export default Index;
