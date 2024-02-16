import AccountHeaderComponent from '@components/accountHeader';
import BottomBar from '@components/tabBar';
import useStackingData from '@hooks/queries/useStackingData';
import useWalletSelector from '@hooks/useWalletSelector';
import Spinner from '@ui-library/spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import StackingProgress from './stackingProgress';
import StartStacking from './startStacking';

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: 'auto',
  marginBottom: 'auto',
  textAlign: 'center',
  marginLeft: 35,
  marginRight: 35,
}));

function Stacking() {
  const { t } = useTranslation('translation', { keyPrefix: 'STACKING_SCREEN' });
  const { isStackingLoading, stackingData } = useStackingData();
  const [isStacking, setIsStacking] = useState<boolean>(false);
  const { stxAddress } = useWalletSelector();

  useEffect(() => {
    if (stackingData) {
      if (stackingData?.stackerInfo?.stacked || stackingData?.delegationInfo?.delegated) {
        setIsStacking(true);
      }
    }
  }, [stackingData]);

  const showStatus = !isStackingLoading && (isStacking ? <StackingProgress /> : <StartStacking />);

  return (
    <>
      <AccountHeaderComponent />
      {!stxAddress && <Text>{t('NO_EARN_OPTION')}</Text>}
      {isStackingLoading && stxAddress && (
        <LoaderContainer>
          <Spinner color="white" size={30} />
        </LoaderContainer>
      )}
      {showStatus}
      <BottomBar tab="stacking" />
    </>
  );
}

export default Stacking;
