import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import NftTab from '@assets/img/bottomTabBar/nft_tab.svg';
import SettingsTab from '@assets/img/bottomTabBar/setting_tab.svg';
import StackingTab from '@assets/img/bottomTabBar/stacking_tab.svg';
import WalletTab from '@assets/img/bottomTabBar/wallet_tab.svg';
import UnselectedNftTab from '@assets/img/bottomTabBar/unselected_nft_tab.svg';
import UnselectedSettingsTab from '@assets/img/bottomTabBar/unselected_setting_tab.svg';
import UnselectedStackingTab from '@assets/img/bottomTabBar/unselected_stacking_tab.svg';
import UnselectedWalletTab from '@assets/img/bottomTabBar/unselected_wallet_tab.svg';

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  height: 64,
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(30),
  paddingRight: props.theme.spacing(30),
  borderTop: `1px solid ${props.theme.colors.background.elevation3}`,
}));

const Button = styled.button({
  backgroundColor: 'transparent',
});

type Tab = 'dashboard' | 'nft' | 'stacking' | 'settings';

interface Props {
  tab: Tab
}
function BottomTabBar({ tab }:Props) {
  const navigate = useNavigate();

  const handleDashboardButtonClick = () => {
    if (tab !== 'dashboard') { navigate('/'); }
  };

  const handleNftButtonClick = () => {

  };

  const handleStackingButtonClick = () => {

  };

  const handleSettingButtonClick = () => {

  };

  return (
    <RowContainer>
      <Button onClick={handleDashboardButtonClick}>
        <img src={tab === 'dashboard' ? WalletTab : UnselectedWalletTab} alt="dashboard" />
      </Button>
      <Button onClick={handleNftButtonClick}>
        <img src={tab === 'nft' ? NftTab : UnselectedNftTab} alt="nft" />
      </Button>
      <Button onClick={handleStackingButtonClick}>
        <img src={tab === 'stacking' ? StackingTab : UnselectedStackingTab} alt="stacking" />
      </Button>
      <Button onClick={handleSettingButtonClick}>
        <img src={tab === 'settings' ? SettingsTab : UnselectedSettingsTab} alt="settings" />
      </Button>
    </RowContainer>
  );
}

export default BottomTabBar;
