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
import useBtcWalletData from '@hooks/queries/useBtcWalletData';

const HeaderContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const TableContainer = styled.div((props) => ({
  display: 'flex',
  flex: '2',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  position: 'relative',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const DlcTable = styled.table(() => ({}));

const DlcTableHeaderRow = styled.tr(() => ({
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

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(11),
  marginBottom: props.theme.spacing(8),
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
  const { t } = useTranslation('translation', { keyPrefix: 'DLC_SCREEN' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { contracts } = useSelector((state: StoreState) => state.dlcState);

  const {
    isLoading: loadingBtcWalletData,
    isRefetching: refetchingBtcWalletData,
    refetch,
  } = useBtcWalletData();

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    dispatch(handleContractRequest());
  }, []);

  const onBTCSendClick = () => {
    navigate('/dlc/send-btc-prefilled/nested');
  };

  const onBTCReceiveClick = () => {
    navigate('/dlc/send-btc-prefilled/native');
  };

  return (
    <>
      <AccountHeaderComponent />
      <HeaderContainer>
        <BalanceCard isLoading={loadingBtcWalletData || refetchingBtcWalletData} />
        <RowButtonContainer>
          <ButtonContainer>
            <ActionButton src={ArrowUpRight} text={t('SEND_TO_MAIN')} onPress={onBTCSendClick} />
          </ButtonContainer>
          <ButtonContainer>
            <ActionButton
              src={ArrowDownLeft}
              text={t('RECEIVE_FROM_MAIN')}
              onPress={onBTCReceiveClick}
            />
          </ButtonContainer>
        </RowButtonContainer>
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
              <DlcTableElement key={contract.temporaryContractId} contract={contract} />
            ))}
          </DlcTable>
        ) : (
          <RowContainer>
            <DlcInfoText>{t('NO_DLC')}</DlcInfoText>
          </RowContainer>
        )}
      </TableContainer>
      <BottomTabBar tab="dlc" />
    </>
  );
}

export default DlcList;
