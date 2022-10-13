import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

const Button = styled.button((props) => ({
  backgroundColor: 'transparent',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

type Tab = 'home' | 'nft' | 'stacking' | 'settings';

function BottomTabBar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    switch (activeTab) {
      case 'home':
        navigate('/');
        break;
      case 'nft':
        break;
      case 'stacking':
        break;
      case 'settings':
        break;
    }
  }, [activeTab]);

  return (
    <>
      <Seperator />
      <RowContainer>
        <Button onClick={() => setActiveTab('home')}>
          <ButtonImage src={activeTab === 'home' ? WalletTab : UnselectedWalletTab} />
        </Button>
        <Button onClick={() => setActiveTab('nft')}>
          <ButtonImage src={activeTab === 'nft' ? NftTab : UnselectedNftTab} />
        </Button>
        <Button onClick={() => setActiveTab('stacking')}>
          <ButtonImage src={activeTab === 'stacking' ? StackingTab : UnselectedStackingTab} />
        </Button>
        <Button onClick={() => setActiveTab('settings')}>
          <ButtonImage src={activeTab === 'settings' ? SettingsTab : UnselectedSettingsTab} />
        </Button>
      </RowContainer>
    </>
  );
}

export default BottomTabBar;
