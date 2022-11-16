import AccountRow from '@components/accountRow';
import { StoreState } from '@stores/index';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ThreeDots from '@assets/img/dots_three_vertical.svg';
import { useState } from 'react';
import OptionsDialog from './optionsDialog';

const SelectedAccountContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const OptionsButton = styled.button((props) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  justifyContent: 'flex-end',
  background: 'transparent',
  marginTop: props.theme.spacing(8),
}));

function AccountHeaderComponent() {
  const navigate = useNavigate();
  const {
    selectedAccount,
  } = useSelector((state: StoreState) => state.walletState);
  const [showOptionsDialog, setShowOptionsDialog] = useState<boolean>(false);
  const handleAccountSelect = () => {
    navigate('/account-list');
  };
  const handleOptionsSelect = () => {
    setShowOptionsDialog(true);
  };
  return (
    <SelectedAccountContainer>
      <AccountRow account={selectedAccount!} isSelected onAccountSelected={handleAccountSelect} />
      <OptionsButton onClick={handleOptionsSelect}>
        <img src={ThreeDots} alt="Options" />
        {showOptionsDialog && <OptionsDialog />}
      </OptionsButton>
    </SelectedAccountContainer>
  );
}

export default AccountHeaderComponent;
