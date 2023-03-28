import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
import DlcTableElement from '@components/dlcTableElement';
import BottomTabBar from '@components/tabBar';
import AccountHeaderComponent from '@components/accountHeader';
import BalanceCard from '@screens/home/balanceCard';
import { useEffect } from 'react';
import { handleContractRequest } from '@stores/dlc/actions/actionCreators';
import ActionButton from '@components/button';
import ArrowDownLeft from '@assets/img/dashboard/arrow_down_left.svg';
import ArrowUpRight from '@assets/img/dashboard/arrow_up_right.svg';
import { fetchBtcWalletDataRequestAction } from '@stores/wallet/actions/actionCreators';

const HeaderContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  marginLeft: '16px',
  marginRight: '16px',
}));

const TableContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '16px',
  marginRight: '16px',
  position: 'relative',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const TestnetContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: props.theme.colors.background.elevation1,
  paddingTop: props.theme.spacing(3),
  paddingBottom: props.theme.spacing(3),
}));

const TestnetText = styled.h1((props) => ({
  ...props.theme.body_xs,
  textAlign: 'center',
  color: props.theme.colors.white['200'],
}));

const DlcTable = styled.table((props) => ({}));

const DlcTableHeaderRow = styled.tr((props) => ({
  width: '100%',
  height: 64,
}));

const DlcTableHeaderDataNarrow = styled.th((props) => ({
  width: '20%',
  ...props.theme.body_xs,
  textAlign: 'left',
  color: 'white',
}));

const DlcTableHeaderDataWide = styled.th((props) => ({
  width: '30%',
  ...props.theme.body_xs,
  textAlign: 'left',
  color: 'white',
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(8),
  borderBottom: `0.5px solid ${props.theme.colors.background.elevation3}`,
}));

const ButtonContainer = styled.div((props) => ({
  width: '100%',
  marginLeft: props.theme.spacing(2.5),
  marginRight: props.theme.spacing(2.5),
}));

const DlcInfoText = styled.h1((props) => ({
  ...props.theme.body_xs,
  textAlign: 'center',
  color: props.theme.colors.white['200'],
}));

function DlcList(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { contracts } = useSelector((state: StoreState) => state.dlcState);
  const { network, dlcBtcAddress, stxBtcRate, btcFiatRate } = useSelector(
    (state: StoreState) => state.walletState
  );

  useEffect(() => {
    dispatch(fetchBtcWalletDataRequestAction(dlcBtcAddress, network.type, stxBtcRate, btcFiatRate));
  }, []);

  useEffect(() => {
    dispatch(handleContractRequest());
  }, []);

  const onBTCSendClick = () => {
    navigate('/send-btc-prefilled/nested');
  };

  const onBTCReceiveClick = () => {
    navigate('/send-btc-prefilled/native');
  };

  return (
    <>
      {network.type === 'Testnet' && (
        <TestnetContainer>
          <TestnetText>{t('TESTNET')}</TestnetText>
        </TestnetContainer>
      )}
      <AccountHeaderComponent />
      <HeaderContainer>
        <BalanceCard />
        <RowContainer>
          <ButtonContainer>
            <ActionButton src={ArrowUpRight} text={'Send'} onPress={onBTCSendClick} />
          </ButtonContainer>
          <ButtonContainer>
            <ActionButton src={ArrowDownLeft} text={'Receive'} onPress={onBTCReceiveClick} />
          </ButtonContainer>
        </RowContainer>
      </HeaderContainer>
      <TableContainer>
        {contracts.length !== 0 ? (
          <DlcTable>
            <DlcTableHeaderRow>
              <DlcTableHeaderDataWide>Contract ID</DlcTableHeaderDataWide>
              <DlcTableHeaderDataWide>Collateral</DlcTableHeaderDataWide>
              <DlcTableHeaderDataNarrow>Details</DlcTableHeaderDataNarrow>
              <DlcTableHeaderDataNarrow>Funding TX</DlcTableHeaderDataNarrow>
            </DlcTableHeaderRow>
            {contracts.map((contract) => (
              <>
                <DlcTableElement key={contract.temporaryContractId} contract={contract} />
              </>
            ))}
          </DlcTable>
        ) : (
          <RowContainer>
            <DlcInfoText>No DLCs to show!</DlcInfoText>
          </RowContainer>
        )}
      </TableContainer>
      <BottomTabBar tab="dlc" />
    </>
  );
}

export default DlcList;
