import AccountHeaderComponent from '@components/accountHeader';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import { StyledP } from '@ui-library/common.styled';
import { POPUP_WIDTH } from '@utils/constants';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  margin-left: 5%;
  margin-right: 5%;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

// TODO: this screen will be re-implemented in future iteration of exotics sats
function RareSatsDetailScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const { setSelectedSatBundleItemIndex } = useSatBundleDataReducer();
  useResetUserFlow('/rare-sats-detail');

  const isGalleryOpen: boolean = useMemo(
    () => document.documentElement.clientWidth > POPUP_WIDTH,
    [],
  );

  const handleBackButtonClick = () => {
    // only go back if there is history
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/nft-dashboard?tab=rareSats');
    }
    setSelectedSatBundleItemIndex(null);
  };

  return (
    <>
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      ) : (
        <TopRow title="Item detail" onClick={handleBackButtonClick} />
      )}
      <Container>
        <StyledP typography="body_bold_l">TODO</StyledP>
      </Container>
      <BottomBarContainer>
        <BottomTabBar tab="nft" />
      </BottomBarContainer>
    </>
  );
}

export default RareSatsDetailScreen;
