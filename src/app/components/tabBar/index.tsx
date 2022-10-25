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
import Seperator from '@components/seperator';

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(8),
  marginLeft: props.theme.spacing(30),
  marginRight: props.theme.spacing(30),
}));

const Button = styled.button({
  backgroundColor: 'transparent',
});

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

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
    <>
      <Seperator />
      <RowContainer>
        <Button onClick={handleDashboardButtonClick}>
          <ButtonImage src={tab === 'dashboard' ? WalletTab : UnselectedWalletTab} />
        </Button>
        <Button onClick={handleNftButtonClick}>
          <ButtonImage src={tab === 'nft' ? NftTab : UnselectedNftTab} />
        </Button>
        <Button onClick={handleStackingButtonClick}>
          <ButtonImage src={tab === 'stacking' ? StackingTab : UnselectedStackingTab} />
        </Button>
        <Button onClick={handleSettingButtonClick}>
          <ButtonImage src={tab === 'settings' ? SettingsTab : UnselectedSettingsTab} />
        </Button>
      </RowContainer>
    </>
  );
}

export default BottomTabBar;
