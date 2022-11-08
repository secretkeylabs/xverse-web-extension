import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchAppInfo, getBnsName } from '@secretkeylabs/xverse-core/api';
import { FeesMultipliers, FungibleToken } from '@secretkeylabs/xverse-core/types';
import ListDashes from '@assets/img/dashboard/list_dashes.svg';
import CreditCard from '@assets/img/dashboard/credit_card.svg';
import ArrowDownLeft from '@assets/img/dashboard/arrow_down_left.svg';
import ArrowUpRight from '@assets/img/dashboard/arrow_up_right.svg';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import TokenTile from '@components/tokenTile';
import AccountRow from '@components/accountRow';
import CoinSelectModal from '@screens/home/coinSelectModal';
import Theme from 'theme';
import ActionButton from '@components/button';
import {
  fetchAccountAction,
  fetchBtcWalletDataRequestAction,
  fetchCoinDataRequestAction,
  FetchFeeMultiplierAction,
  fetchRatesAction,
  fetchStxWalletDataRequestAction,
} from '@stores/wallet/actions/actionCreators';
import BottomBar from '@components/tabBar';
import { StoreState } from '@stores/index';
import { Account } from '@stores/wallet/actions/types';
import Seperator from '@components/seperator';
import BalanceCard from './balanceCard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 16px;
  margin-right: 16px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'space-between',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(11),
}));

const CoinContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'space-between',
  justifyContent: 'space-between',
});

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(11),
}));

const ButtonContainer = styled.div({
  flex: 0.31,
});

const SelectedAccountContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const TokenListButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(4),
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

function Home(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [openSendModal, setOpenSendModal] = useState(false);
  const [list, setList] = useState<FungibleToken[]>([]);
  const {
    stxAddress,
    btcAddress,
    masterPubKey,
    stxPublicKey,
    btcPublicKey,
    accountsList,
    selectedAccount,
    fiatCurrency,
    btcFiatRate,
    stxBtcRate,
    network,
    coinsList,
    loadingWalletData,
    loadingBtcData,
  } = useSelector((state: StoreState) => state.walletState);

  const fetchFeeMultiplierData = async () => {
    const response: FeesMultipliers = await fetchAppInfo();
    dispatch(FetchFeeMultiplierAction(response));
  };

  const fetchAccount = async () => {
    const bnsName = await getBnsName(stxAddress, network);
    if (accountsList.length === 0) {
      const accounts: Account[] = [
        {
          id: 0,
          stxAddress,
          btcAddress,
          masterPubKey,
          stxPublicKey,
          btcPublicKey,
          bnsName,
        },
      ];
      dispatch(fetchAccountAction(accounts[0], accounts));
    } else {
      selectedAccount!.bnsName = bnsName;
      const account = accountsList.find((accountInArray) => accountInArray.stxAddress === selectedAccount?.stxAddress);
      account!.bnsName = bnsName;
      dispatch(fetchAccountAction(selectedAccount!, accountsList));
    }
  };

  const loadInitialData = useCallback(() => {
    if (stxAddress && btcAddress) {
      fetchAccount();
      fetchFeeMultiplierData();
      dispatch(fetchRatesAction(fiatCurrency));
      dispatch(fetchStxWalletDataRequestAction(stxAddress, network, fiatCurrency, stxBtcRate));
      dispatch(fetchBtcWalletDataRequestAction(btcAddress, network.type, stxBtcRate, btcFiatRate));
      dispatch(fetchCoinDataRequestAction(stxAddress, network, fiatCurrency, coinsList));
    }
  }, [stxAddress]);

  useEffect(() => {
    loadInitialData();
  }, [masterPubKey, stxAddress, btcAddress, loadInitialData]);

  useEffect(() => {
    const userCoinList: FungibleToken[] = coinsList ? coinsList?.filter((ft) => ft.visible) : [];
    setList(userCoinList);
  }, [coinsList]);

  const onReceiveModalOpen = () => {
    setOpenReceiveModal(true);
  };

  const onReceiveModalClose = () => {
    setOpenReceiveModal(false);
  };

  const onSendModalOpen = () => {
    setOpenSendModal(true);
  };

  const onSendModalClose = () => {
    setOpenSendModal(false);
  };

  const handleAccountSelect = () => {
    navigate('/account-list');
  };

  function getCoinsList() {
    return coinsList ? coinsList?.filter((ft) => ft.visible) : [];
  }

  const handleManageTokenListOnClick = () => {
    navigate('/manage-tokens');
  };

  const onStxSendClick = () => {
    navigate('/send-stx');
  };

  const onBtcSendClick = () => {
    navigate('/send-btc');
  };

  const onBTCReceiveSelect = () => {
    navigate('/receive/BTC');
  };

  const onSTXReceiveSelect = () => {
    navigate('/receive/STX');
  };

  const testnetBannerView = network.type === 'Testnet' && (
    <TestnetContainer>
      <TestnetText>
        {t('TESTNET')}
      </TestnetText>
    </TestnetContainer>
  );

  return (
    <>
      {testnetBannerView}
      <SelectedAccountContainer>
        <AccountRow account={selectedAccount!} isSelected onAccountSelected={handleAccountSelect} />
      </SelectedAccountContainer>
      <Seperator />

      <Container>
        <BalanceCard />
        <RowButtonContainer>
          <ButtonContainer>
            <ActionButton src={ArrowUpRight} text={t('SEND')} onPress={onSendModalOpen} />
          </ButtonContainer>
          <ButtonContainer>
            <ActionButton src={ArrowDownLeft} text={t('RECEIVE')} onPress={onReceiveModalOpen} />
          </ButtonContainer>
          <ButtonContainer>
            <ActionButton src={CreditCard} text={t('BUY')} onPress={onReceiveModalOpen} />
          </ButtonContainer>
        </RowButtonContainer>

        <TokenListButtonContainer>
          <ActionButton
            src={ListDashes}
            buttonColor="transparent"
            text={t('MANAGE_TOKEN')}
            buttonAlignment="flex-end"
            onPress={handleManageTokenListOnClick}
          />
        </TokenListButtonContainer>

        <ColumnContainer>
          <TokenTile
            title={t('BITCOIN')}
            currency="BTC"
            icon={IconBitcoin}
            loading={loadingBtcData}
            underlayColor={Theme.colors.background.elevation1}
          />
          <TokenTile
            title={t('STACKS')}
            currency="STX"
            icon={IconStacks}
            loading={loadingWalletData}
            underlayColor={Theme.colors.background.elevation1}
          />
        </ColumnContainer>

        <CoinContainer>
          {list.map((coin) => (
            <TokenTile
              key={coin.name.toString()}
              title={coin.name}
              currency="FT"
              loading={loadingWalletData}
              underlayColor={Theme.colors.background.elevation1}
              fungibleToken={coin}
            />
          ))}
        </CoinContainer>
        <CoinSelectModal
          onSelectBitcoin={onBTCReceiveSelect}
          onSelectStacks={onSTXReceiveSelect}
          onClose={onReceiveModalClose}
          onSelectCoin={onSTXReceiveSelect}
          visible={openReceiveModal}
          coins={getCoinsList()}
          title={t('RECEIVE')}
        />

        <CoinSelectModal
          onSelectBitcoin={onBtcSendClick}
          onSelectStacks={onStxSendClick}
          onClose={onSendModalClose}
          onSelectCoin={onStxSendClick}
          visible={openSendModal}
          coins={getCoinsList()}
          title={t('SEND')}
        />
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default Home;
