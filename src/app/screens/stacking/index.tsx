import { Ring } from 'react-spinners-css';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useStackingData from '@hooks/useStackingData';
import BottomBar from '@components/tabBar';
import Seperator from '@components/seperator';
import AccountHeaderComponent from '@components/accountHeader';
import StackingProgress from './stackingProgress';
import StartStacking from './startStacking';

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

function Stacking() {
  const { isStackingLoading, stackingData } = useStackingData();
  const [isStacking, setIsStacking] = useState<boolean>(false);

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
      <AccountHeaderComponent />
      <Seperator />
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
