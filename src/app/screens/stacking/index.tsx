import { useNavigate } from 'react-router-dom';
import { Ring } from 'react-spinners-css';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useStackingData from '@hooks/useStackingData';
import useWalletSelector from '@hooks/useWalletSelector';
import AccountRow from '@components/accountRow';
import BottomBar from '@components/tabBar';
import StackingProgress from './stackingProgress';
import StartStacking from './startStacking';

const SelectedAccountContainer = styled.div({
  marginLeft: '5%',
  marginRight: '5%',
});

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

function Stacking() {
  const { selectedAccount } = useWalletSelector();
  const { isStackingLoading, stackingData } = useStackingData();
  const navigate = useNavigate();
  const [isStacking, setIsStacking] = useState<boolean>(false);
  const handleAccountSelect = () => {
    navigate('/account-list');
  };

  useEffect(() => {
    if (stackingData) {
      if (stackingData?.stackerInfo?.stacked || stackingData?.delegationInfo?.delegated) {
        setIsStacking(true);
      }
    }
  }, [stackingData]);

  const showStatus = !isStackingLoading && (
    isStacking ? <StackingProgress /> : <StartStacking />
  );

  return (
    <>
      <SelectedAccountContainer>
        <AccountRow account={selectedAccount!} isSelected onAccountSelected={handleAccountSelect} />
      </SelectedAccountContainer>
      {isStackingLoading && (
        <LoaderContainer>
          <Ring color="white" size={30} />
        </LoaderContainer>
      ) }
      {showStatus}
      <BottomBar tab="stacking" />
    </>

  );
}

export default Stacking;
