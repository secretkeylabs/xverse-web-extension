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
import TokenTile from '@components/tokenTile';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import { CurrencyTypes } from '@utils/constants';
import Theme from 'theme';
import { ContractState } from 'dlc-lib';

const HeaderContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const TableContainer = styled.div((props) => ({
  display: 'flex',
  flex: '1',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const DlcTable = styled.table(() => ({}));

const DlcTableHeaderRow = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  height: '32px',
  backgroundColor: props.theme.colors.background.elevation6,
}));

const DlcTableHeaderDataNarrow = styled.div((props) => ({
  width: '8%',
  ...props.theme.body_xs,
  alignContent: 'center',
  textAlign: 'left',
  paddingLeft: props.theme.spacing(2),
  color: 'white',
}));

const DlcTableHeaderDataWide = styled.div((props) => ({
  width: '28%',
  ...props.theme.body_xs,
  alignContent: 'center',
  textAlign: 'left',
  paddingLeft: props.theme.spacing(2),
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

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'space-between',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  borderBottom: `1px solid ${props.theme.colors.background.elevation3}`,
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

  const handleTokenPressed = (token: { coin: CurrencyTypes; ft: string | undefined }) => {
    navigate(`/coinDashboard/${token.coin}?ft=${token.ft}`);
  };

  const onBTCSendClick = () => {
    navigate('/send-btc-prefilled/nested');
  };

  const onBTCReceiveClick = () => {
    navigate('/send-btc-prefilled/native');
  };

  return (
    <>
      <AccountHeaderComponent />
      <HeaderContainer>
        <BalanceCard isLoading={loadingBtcWalletData || refetchingBtcWalletData} />
        <RowButtonContainer>
          <ButtonContainer>
            <ActionButton
              disabled={true}
              src={ArrowUpRight}
              text={t('SEND_TO_MAIN')}
              onPress={onBTCSendClick}
            />
          </ButtonContainer>
          <ButtonContainer>
            <ActionButton
              src={ArrowDownLeft}
              text={t('RECEIVE_FROM_MAIN')}
              onPress={onBTCReceiveClick}
            />
          </ButtonContainer>
        </RowButtonContainer>
        <ColumnContainer>
          <TokenTile
            title={t('BITCOIN')}
            currency="BTC"
            icon={IconBitcoin}
            loading={loadingBtcWalletData || refetchingBtcWalletData}
            underlayColor={Theme.colors.background.elevation1}
            onPress={handleTokenPressed}
          />
        </ColumnContainer>
      </HeaderContainer>

      {contracts.length !== 0 ? (
        <>
          <DlcTableHeaderRow>
            <DlcTableHeaderDataWide>ID</DlcTableHeaderDataWide>
            <DlcTableHeaderDataWide>Collateral</DlcTableHeaderDataWide>
            <DlcTableHeaderDataWide>State</DlcTableHeaderDataWide>
            <DlcTableHeaderDataNarrow>Info</DlcTableHeaderDataNarrow>
            <DlcTableHeaderDataNarrow>TX</DlcTableHeaderDataNarrow>
          </DlcTableHeaderRow>
          <TableContainer>
            <DlcTable>
              {[...contracts]
                .filter((contract) => contract.state !== ContractState.Offered)
                .map((contract) => (
                  <DlcTableElement key={contract.temporaryContractId} contract={contract} />
                ))}
            </DlcTable>
          </TableContainer>
        </>
      ) : (
        <RowContainer>
          <DlcInfoText>{t('NO_DLC')}</DlcInfoText>
        </RowContainer>
      )}

      <BottomTabBar tab="dlc" />
    </>
  );
}

export default DlcList;
