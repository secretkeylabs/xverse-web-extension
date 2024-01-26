import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import CoinItem from '@screens/manageTokens/coinItem';
import { Coin, FungibleToken } from '@secretkeylabs/xverse-core';
import { StoreState } from '@stores/index';
import {
  FetchUpdatedVisibleCoinListAction,
  setBrcCoinsDataAction,
} from '@stores/wallet/actions/actionCreators';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const TokenContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }

  margin-bottom: ${(props) => props.theme.space.xl};
  > *:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.colors.elevation3};
  }
`;

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  paddingLeft: 16,
  paddingRight: 16,
  height: '100%',
});

const ScrollableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const FtInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(8),
}));

const Button = styled.button<{
  isSelected: boolean;
}>((props) => ({
  ...props.theme.typography.body_bold_l,
  fontSize: 12,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 31,
  paddingLeft: props.theme.spacing(6),
  paddingRight: props.theme.spacing(6),
  marginRight: props.theme.spacing(2),
  borderRadius: 44,
  background: props.isSelected ? props.theme.colors.elevation3 : 'transparent',
  color: props.theme.colors.white_0,
  opacity: props.isSelected ? 1 : 0.6,
  userSelect: 'none',
}));

const Header = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  marginBottom: props.theme.spacing(8),
}));

const Description = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(16),
}));

function Stacks() {
  const { hideStx } = useWalletSelector();
  const { toggleStxVisibility } = useWalletReducer();
  const tickerConstant = 'STX';
  return (
    <CoinItem
      id={tickerConstant}
      key={tickerConstant}
      name="Stacks"
      ticker={tickerConstant}
      image={stacksIcon}
      disabled={false}
      toggled={toggleStxVisibility}
      enabled={!hideStx}
    />
  );
}

enum Protocols {
  SIP_10 = 'SIP-10',
  BRC_20 = 'BRC-20',
}

function ManageTokens() {
  const { t } = useTranslation('translation', { keyPrefix: 'TOKEN_SCREEN' });
  const { coinsList, coins, brcCoinsList, selectedAccount } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const [selectedProtocol, setSelectedProtocol] = useState<Protocols>(
    selectedAccount?.stxAddress ? Protocols.SIP_10 : Protocols.BRC_20,
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggled = (isEnabled: boolean, coinName, coinKey) => {
    /* if coins exists in list of fungible token, update the visible property otherwise
     add coin in list if coin is set to visible */

    const coinToBeUpdated =
      coinsList?.find((ft) => ft.principal === coinKey) ??
      brcCoinsList?.find((ft) => ft.principal === coinKey);

    if (coinToBeUpdated) {
      coinToBeUpdated.visible = isEnabled;
    } else if (isEnabled) {
      const coinToBeAdded: FungibleToken = {
        name: coinName,
        visible: true,
        principal: coinKey,
        balance: '0',
        total_sent: '',
        total_received: '',
        assetName: '',
      };
      if (selectedProtocol === Protocols.SIP_10) {
        coinsList?.push(coinToBeAdded);
      } else if (selectedProtocol === Protocols.BRC_20) {
        brcCoinsList?.push(coinToBeAdded);
      }
    }

    if (coinsList && selectedProtocol === Protocols.SIP_10) {
      const modifiedCoinsList = [...coinsList];
      dispatch(FetchUpdatedVisibleCoinListAction(modifiedCoinsList));
    }

    if (brcCoinsList && selectedProtocol === Protocols.BRC_20) {
      const modifiedCoinsList = [...brcCoinsList];
      dispatch(setBrcCoinsDataAction(modifiedCoinsList));
    }
  };

  const handleBackButtonClick = () => {
    navigate('/');
  };

  const selectedCoins = selectedProtocol === Protocols.SIP_10 ? coins : brcCoinsList;

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <ScrollableContainer>
          <Header>{t('ADD_COINS')}</Header>
          <Description>{t('DESCRIPTION')}</Description>
          <FtInfoContainer>
            {selectedAccount?.stxAddress && (
              <Button
                isSelected={selectedProtocol === Protocols.SIP_10}
                onClick={() => setSelectedProtocol(Protocols.SIP_10)}
              >
                {Protocols.SIP_10}
              </Button>
            )}
            <Button
              isSelected={selectedProtocol === Protocols.BRC_20}
              onClick={() => setSelectedProtocol(Protocols.BRC_20)}
            >
              {Protocols.BRC_20}
            </Button>
          </FtInfoContainer>
          <TokenContainer>
            {selectedProtocol === Protocols.SIP_10 && <Stacks />}
            {selectedCoins?.map((coin: FungibleToken | Coin) => {
              const coinId = 'principal' in coin ? coin.principal : coin.contract;
              return (
                <CoinItem
                  id={coinId}
                  key={coinId}
                  name={coin.name}
                  image={coin.image}
                  ticker={coin.ticker}
                  disabled={false}
                  toggled={toggled}
                  enabled={coin.visible}
                />
              );
            })}
          </TokenContainer>
        </ScrollableContainer>
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default ManageTokens;
