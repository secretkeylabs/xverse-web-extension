import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ListDashes from '@assets/img/dashboard/list_dashes.svg';
import CreditCard from '@assets/img/dashboard/credit_card.svg';
import ArrowDownLeft from '@assets/img/dashboard/arrow_down_left.svg';
import ArrowUpRight from '@assets/img/dashboard/arrow_up_right.svg';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import TokenTile from '@components/tokenTile';
import BigNumber from 'bignumber.js';
import { useNavigate } from 'react-router-dom';
import AccountRow from '@components/accountRow';
import { useEffect, useState } from 'react';
import CoinSelectModal from '@components/coinSelectModal';
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
import { microstacksToStx, satsToBtc } from '@secretkeylabs/xverse-core/currency';
import { NumericFormat } from 'react-number-format';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import BarLoader from '@components/barLoader';
import { LoaderSize } from '@utils/constants';
import { FungibleToken } from '@secretkeylabs/xverse-core/types';

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

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(11),
}));

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'space-between',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(11),
}));

const CoinContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'space-between',
  justifyContent: 'space-between',
}));

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(11),
}));

const ButtonContainer = styled.div((props) => ({
  flex: 0.31,
}));

const SelectedAccountContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const BalanceHeadingText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['200'],
  textTransform: 'uppercase',
  opacity: 0.7,
}));

const CurrencyText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['0'],
  fontSize: 13,
  padding: props.theme.spacing(1),
}));

const BalanceAmountText = styled.h1((props) => ({
  ...props.theme.headline_l,
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(4),
}));

const BarLoaderContainer = styled.div((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(5),
}));

const CurrencyCard = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: props.theme.colors.background.elevation3,
  width: 45,
  borderRadius: 30,
  marginLeft: props.theme.spacing(4),
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
    stxBalance,
    btcBalance,
    coinsList,
    loadingWalletData,
  } = useSelector((state: StoreState) => state.walletState);

  async function loadInitialData() {
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
  }

  useEffect(() => {
    loadInitialData();
  }, [masterPubKey, stxAddress, btcAddress]);

  function onReceiveModalOpen() {
    setOpenReceiveModal(true);
  }

  function onReceiveModalClose() {
    setOpenReceiveModal(false);
  }

  function onSendModalOpen() {
    setOpenSendModal(true);
  }

  function onSendModalClose() {
    setOpenSendModal(false);
  }

  function handleAccountSelect() {
    navigate('/account-list');
  }

  function getCoinsList() {
    return coinsList ? coinsList?.filter((ft) => ft.visible) : [];
  }

  function calculateTotalBalance(
    stxBalance: BigNumber,
    btcBalance: BigNumber,
    stxBtcRate: BigNumber,
    btcFiatRate: BigNumber
  ) {
    const stxFiatEquiv = microstacksToStx(stxBalance)
      .multipliedBy(stxBtcRate)
      .multipliedBy(btcFiatRate);
    const btcFiatEquiv = satsToBtc(btcBalance).multipliedBy(btcFiatRate);
    const totalBalance = stxFiatEquiv.plus(btcFiatEquiv);
    return totalBalance.toNumber().toFixed(2);
  }

  function getBalancePrefix() {
    return `${currencySymbolMap[fiatCurrency]}`;
  }
  function renderBalanceCard() {
    return (
      <>
        <RowContainer>
          <BalanceHeadingText>{t('TOTAL_BALANCE')}</BalanceHeadingText>
          <CurrencyCard>
            <CurrencyText>{fiatCurrency}</CurrencyText>
          </CurrencyCard>
        </RowContainer>
        {loadingWalletData ? (
          <BarLoaderContainer>
            <BarLoader loaderSize={LoaderSize.LARGE} />
          </BarLoaderContainer>
        ) : (
          <BalanceAmountText>
            <NumericFormat
              value={calculateTotalBalance(
                new BigNumber(stxBalance),
                new BigNumber(btcBalance),
                new BigNumber(stxBtcRate),
                new BigNumber(btcFiatRate)
              )}
              displayType={'text'}
              prefix={`${getBalancePrefix()} `}
              thousandSeparator={true}
              renderText={(value: string) => <BalanceAmountText>{value}</BalanceAmountText>}
            />
          </BalanceAmountText>
        )}
      </>
    );
  }

  function renderButtons() {
    return (
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
    );
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

  function renderManageTokenList() {
    return (
      <TokenListButtonContainer>
        <ActionButton
          src={ListDashes}
          buttonColor={'transparent'}
          text={t('MANAGE_TOKEN')}
          buttonAlignment={'flex-end'}
          onPress={handleManageTokenListOnClick}
        />
      </TokenListButtonContainer>
    );
  }

  function renderFixedCoins() {
    return (
      <ColumnContainer>
        <TokenTile
          title={t('BITCOIN')}
          currency={'BTC'}
          icon={IconBitcoin}
          underlayColor={Theme.colors.background.elevation1}
        />
        <TokenTile
          title={t('STACKS')}
          currency={'STX'}
          icon={IconStacks}
          underlayColor={Theme.colors.background.elevation1}
        />
      </ColumnContainer>
    );
  }

  function renderReceiveScreenModal() {
    return (
      <CoinSelectModal
        onSelectBitcoin={handleManageTokenListOnClick}
        onSelectStacks={onBTCReceiveSelect}
        onClose={onReceiveModalClose}
        onSelectCoin={handleManageTokenListOnClick}
        visible={openReceiveModal}
        coins={getCoinsList()}
        title={t('RECEIVE')}
      />
    );
  }

  function renderSendScreenModal() {
    return (
      <CoinSelectModal
        onSelectBitcoin={onBtcSendClick}
        onSelectStacks={onStxSendClick}
        onClose={onSendModalClose}
        onSelectCoin={onStxSendClick}
        visible={openSendModal}
        coins={getCoinsList()}
        title={t('SEND')}
      />
    );
  }
  function renderCoinData() {
    const list: FungibleToken[] = getCoinsList();
    return (
      <CoinContainer>
        {list.map((coin) => {
          return (
            <>
              <TokenTile
                title={coin.name}
                currency={'FT'}
                underlayColor={Theme.colors.background.elevation1}
                fungibleToken={coin}
              />
            </>
          );
        })}
      </CoinContainer>
    );
  }

  return (
    <>
      <SelectedAccountContainer>
        <AccountRow
          account={selectedAccount!}
          isSelected={true}
          onAccountSelected={handleAccountSelect}
        />
      </SelectedAccountContainer>
      <Seperator />
      <Container>
        {renderBalanceCard()}
        {renderButtons()}
        {renderManageTokenList()}
        {renderFixedCoins()}
        {renderCoinData()}
        {renderReceiveScreenModal()}
        {renderSendScreenModal()}
      </Container>
      <BottomBar />
    </>
  );
}

export default Home;
