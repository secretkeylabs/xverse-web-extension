import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ListDashes from '@assets/img/dashboard/list_dashes.svg';
import CreditCard from '@assets/img/dashboard/credit_card.svg';
import ArrowDownLeft from '@assets/img/dashboard/arrow_down_left.svg';
import ArrowUpRight from '@assets/img/dashboard/arrow_up_right.svg';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import TokenTile from '@components/tokenTile';
import { useNavigate } from 'react-router-dom';
import AccountRow from '@components/accountRow';
import { useCallback, useEffect, useState } from 'react';
import CoinSelectModal from '@screens/home/coinSelectModal';
import Theme from 'theme';
import ActionButton from '@components/button';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAccountAction,
  fetchBtcWalletDataRequestAction,
  fetchCoinDataRequestAction,
  fetchRatesAction,
  fetchStxWalletDataRequestAction,
} from '@stores/wallet/actions/actionCreators';
import BottomBar from '@components/tabBar';
import { StoreState } from '@stores/index';
import { Account } from '@stores/wallet/actions/types';
import Seperator from '@components/seperator';
import { FungibleToken } from '@secretkeylabs/xverse-core/types';
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
  } = useSelector((state: StoreState) => state.walletState);

  const loadInitialData = useCallback(() => {
    if (stxAddress && btcAddress) {
      if (accountsList.length === 0) {
        const accounts: Account[] = [
          {
            id: 0,
            stxAddress,
            btcAddress,
            masterPubKey,
            stxPublicKey,
            btcPublicKey,
          },
        ];
        dispatch(fetchAccountAction(accounts[0], accounts));
      } else {
        dispatch(fetchAccountAction(selectedAccount!, accountsList));
      }
      dispatch(fetchRatesAction(fiatCurrency));
      dispatch(fetchStxWalletDataRequestAction(stxAddress, network, fiatCurrency, stxBtcRate));
      dispatch(fetchBtcWalletDataRequestAction(btcAddress, network, stxBtcRate, btcFiatRate));
      dispatch(fetchCoinDataRequestAction(stxAddress, network, fiatCurrency, coinsList));
    }
  }, [stxAddress, btcAddress]);

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
    navigate('/receive');
  };

  return (
    <>
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
            underlayColor={Theme.colors.background.elevation1}
          />
          <TokenTile
            title={t('STACKS')}
            currency="STX"
            icon={IconStacks}
            underlayColor={Theme.colors.background.elevation1}
          />
        </ColumnContainer>

        <CoinContainer>
          {list.map((coin) => (
            <TokenTile
              title={coin.name}
              currency="FT"
              underlayColor={Theme.colors.background.elevation1}
              fungibleToken={coin}
            />
          ))}
        </CoinContainer>
        <CoinSelectModal
          onSelectBitcoin={handleManageTokenListOnClick}
          onSelectStacks={onBTCReceiveSelect}
          onClose={onReceiveModalClose}
          onSelectCoin={handleManageTokenListOnClick}
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
      <BottomBar />
    </>
  );
}

export default Home;
