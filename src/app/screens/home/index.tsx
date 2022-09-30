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
import { Account } from '@utils/utils';
import { useState } from 'react';
import CoinSelectModal from '@components/coinSelectModal';
import Theme from 'theme';
import ActionButton from '@components/button';

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

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(11),
}));

const ButtonContainer = styled.div((props) => ({
  flex: 0.31,
}));

const BodyContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  flex: 1,
}));

const SelectedAccountContainer = styled.button((props) => ({
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  background: 'transparent',
}));

const Seperator = styled.div((props) => ({
  width: '100%',
  height: 0,
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  marginTop: props.theme.spacing(8),
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
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [openSendModal, setOpenSendModal] = useState(false);

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

  //change
  function handleAccountSelect() {
    navigate('/accountList');
  }
  const acc: Account = {
    btcAddress: '3QAmUHT9jbsjewuAAjta6mtpH8M4tgQJcE',
    btcPublicKey: '039137ce06037cd553b3fd3297fc9da72902ab56da1dae90bae21118c7c79e9144',
    id: 0,
    masterPubKey: '03306da4bddabf83dd0da13f8116179c1406487172380961236f89ebf7212de4fd',
    stxAddress: 'SP1TWMXZB83X6KJAYEHNYVPAGX60Q9C2NVXBQCJMY',
    stxPublicKey: '02d9e3e83034232ab495ca71c43e1ff7fab1413da3b9c05abf4b6925a3642d47cb',
  };

  function renderBalanceCard() {
    return (
      <>
        <RowContainer>
          <BalanceHeadingText>{t('TOTAL_BALANCE')}</BalanceHeadingText>
          <CurrencyCard>
            <CurrencyText>USD</CurrencyText>
          </CurrencyCard>
        </RowContainer>
        <BalanceAmountText>$283,000.00</BalanceAmountText>
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
    navigate('/manageTokens');
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
          stxBalance={new BigNumber(103)}
          btcBalance={new BigNumber(210)}
          stxBtcRate={new BigNumber(0.00001736)}
          btcFiatRate={new BigNumber(18816.8499999925912416)}
          loadingWalletData={false}
          initializedStxData={true}
          initializedFtData={true}
          initializedData={true}
        />

        <TokenTile
          title={t('STACKS')}
          currency={'STX'}
          icon={IconStacks}
          underlayColor={Theme.colors.background.elevation1}
          stxBalance={new BigNumber(103)}
          btcBalance={new BigNumber(0.0002)}
          stxBtcRate={new BigNumber(0.00001736)}
          btcFiatRate={new BigNumber(18816.8499999925912416)}
          loadingWalletData={false}
          initializedStxData={true}
          initializedFtData={true}
          initializedData={true}
        />
      </ColumnContainer>
    );
  }
  //remove
  const coins = [
    {
      assetName: 'miamicoin',
      balance: '2000000',
      decimals: 6,
      name: 'MiamiCoin v2',
      principal: 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.miamicoin-token-v2',
      supported: true,
      ticker: 'MIA',
      tokenFiatRate: 0.000487,
      total_received: '3000000',
      total_sent: '1000000',
      visible: true,
    },
    {
      assetName: 'miamicoin',
      balance: '0',
      decimals: 0,
      image: 'https://cdn.citycoins.co/logos/miamicoin.png',
      name: 'MiamiCoin v1',
      principal: 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-token',
      supported: true,
      ticker: 'MIA',
      tokenFiatRate: 0.000487,
      total_received: '4',
      total_sent: '4',
      visible: true,
    },
  ];

  function renderReceiveScreenModal() {
    return (
      <CoinSelectModal
        onSelectBitcoin={handleManageTokenListOnClick}
        onSelectStacks={onBTCReceiveSelect}
        onClose={onReceiveModalClose}
        onSelectCoin={handleManageTokenListOnClick}
        visible={openReceiveModal}
        coins={coins}
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
        coins={coins}
        title={t('SEND')}
      />
    );
  }
  return (
    <>
      <SelectedAccountContainer onClick={handleAccountSelect}>
        <AccountRow account={acc} isSelected={true} onAccountSelected={handleAccountSelect} />
      </SelectedAccountContainer>
      <Seperator />
      <BodyContainer>
        {renderBalanceCard()}
        {renderButtons()}
        {renderManageTokenList()}
        {renderFixedCoins()}
        {renderReceiveScreenModal()}
        {renderSendScreenModal()}
      </BodyContainer>
    </>
  );
}

export default Home;
