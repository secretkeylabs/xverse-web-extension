/* eslint-disable no-await-in-loop */
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchAppInfo, getBnsName } from '@secretkeylabs/xverse-core/api';
import { FeesMultipliers, FungibleToken, SettingsNetwork } from '@secretkeylabs/xverse-core/types';
import ListDashes from '@assets/img/dashboard/list_dashes.svg';
import CreditCard from '@assets/img/dashboard/credit_card.svg';
import ArrowDownLeft from '@assets/img/dashboard/arrow_down_left.svg';
import ArrowUpRight from '@assets/img/dashboard/arrow_up_right.svg';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import TokenTile from '@components/tokenTile';
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
  getActiveAccountsAction,
} from '@stores/wallet/actions/actionCreators';
import BottomBar from '@components/tabBar';
import { StoreState } from '@stores/index';
import { Account } from '@stores/wallet/actions/types';
import Seperator from '@components/seperator';
import AccountHeaderComponent from '@components/accountHeader';
import { checkAccountActivity } from '@utils/helper';
import { walletFromSeedPhrase } from '@secretkeylabs/xverse-core';
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
  marginTop: props.theme.spacing(12),
}));

const CoinContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'space-between',
  justifyContent: 'space-between',
});

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  opacity: 0.8,
  marginTop: props.theme.spacing(5),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(12),
}));

const ButtonContainer = styled.div({
  flex: 0.31,
});

const TokenListButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: props.theme.spacing(12),
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

function Home() {
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
    seedPhrase,
  } = useSelector((state: StoreState) => state.walletState);

  const fetchFeeMultiplierData = async () => {
    const response: FeesMultipliers = await fetchAppInfo();
    dispatch(FetchFeeMultiplierAction(response));
  };

  const getActiveAccountList = async (
    mnemonic: string,
    selectedNetwork: SettingsNetwork,
    firstAccount: Account,
  ) => {
    try {
      const limit = 19;
      const activeAccountsList: Account[] = [];
      activeAccountsList.push(firstAccount);
      for (let i = 1; i <= limit; i += 1) {
        const response = await walletFromSeedPhrase({ mnemonic, index: BigInt(i), network: selectedNetwork.type });
        const account: Account = {
          id: i,
          stxAddress: response.stxAddress,
          btcAddress: response.btcAddress,
          masterPubKey: response.masterPubKey,
          stxPublicKey: response.stxPublicKey,
          btcPublicKey: response.btcPublicKey,
        };
        activeAccountsList.push(account);

        // check in increments of 5 if account is active
        if (i % 5 === 0) {
          const activityExists = checkAccountActivity(
            activeAccountsList[i - 1].stxAddress,
            activeAccountsList[i - 1].btcAddress,
            selectedNetwork,
          );
          if (!activityExists) {
            break;
          }
        }
      }
      // loop backwards in decrements of 1 to eliminate inactive accounts
      for (let j = activeAccountsList.length - 1; j >= 1; j -= 1) {
        const activityExists = await checkAccountActivity(
          activeAccountsList[j].stxAddress,
          activeAccountsList[j].btcAddress,
          selectedNetwork,
        );
        if (activityExists) {
          break;
        } else {
          activeAccountsList.length = j;
        }
      }
      // fetch bns name for active acounts
      for (let i = 0; i < activeAccountsList.length - 1; i += 1) {
        const response = await getBnsName(activeAccountsList[i].stxAddress, selectedNetwork);
        if (response) activeAccountsList[i].bnsName = response;
      }
      return await Promise.all(activeAccountsList);
    } catch (error) {
      return [firstAccount];
    }
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
      const response = await getActiveAccountList(seedPhrase, network, accounts[0]);
      dispatch(getActiveAccountsAction(response));
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

  return (
    <>
      {network.type === 'Testnet' && (
        <TestnetContainer>
          <TestnetText>{t('TESTNET')}</TestnetText>
        </TestnetContainer>
      )}
      <AccountHeaderComponent />
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
          <Button onClick={handleManageTokenListOnClick}>
            <>
              <ButtonImage src={ListDashes} />
              <ButtonText>{t('MANAGE_TOKEN')}</ButtonText>
            </>
          </Button>
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
