import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import CoinItem from '@screens/manageTokens/coinItem';
import { Coin, FungibleToken } from '@secretkeylabs/xverse-core';
import { StoreState } from '@stores/index';
import { FetchUpdatedVisibleCoinListAction } from '@stores/wallet/actions/actionCreators';
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
`;

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  paddingLeft: 16,
  paddingRight: 16,
});

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
  const tickerConstant = 'stx';
  return (
    <CoinItem
      key="stx"
      coin={{
        name: 'Stacks',
        ticker: tickerConstant,
        image: stacksIcon,
        contract: tickerConstant,
      }}
      disabled={false}
      toggled={toggleStxVisibility}
      enabled={!hideStx}
      showDivider
    />
  );
}

enum Protocols {
  SIP_10 = 'SIP-10',
  BRC_20 = 'BRC-20',
}

function ManageTokens() {
  const { t } = useTranslation('translation', { keyPrefix: 'TOKEN_SCREEN' });
  const { coinsList, coins } = useSelector((state: StoreState) => state.walletState);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocols>(Protocols.SIP_10);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggled = (isEnabled: boolean, coin: Pick<Coin, 'name' | 'contract'>) => {
    /* if coins exists in list of fungible token, update the visible property otherwise
     add coin in list if coin is set to visible */
    const coinToBeUpdated: FungibleToken | undefined = coinsList?.find(
      (ft) => ft.principal === coin.contract,
    );
    if (coinToBeUpdated) coinToBeUpdated.visible = isEnabled;
    else if (!coinToBeUpdated && isEnabled) {
      const coinToBeAdded: FungibleToken = {
        name: coin?.name,
        visible: true,
        principal: coin?.contract,
        balance: '0',
        total_sent: '',
        total_received: '',
        assetName: '',
      };
      coinsList?.push(coinToBeAdded);
    }
    if (coinsList) {
      const modifiedCoinsList = [...coinsList];
      dispatch(FetchUpdatedVisibleCoinListAction(modifiedCoinsList));
    }
  };

  const handleBackButtonClick = () => {
    navigate('/');
  };

  function showDivider(index: number): boolean {
    if (coins) return !(index === coins.length - 1);
    return false;
  }

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Header>{t('ADD_COINS')}</Header>
        <Description>{t('DESCRIPTION')}</Description>
        <FtInfoContainer>
          <Button
            isSelected={selectedProtocol === Protocols.SIP_10}
            onClick={() => setSelectedProtocol(Protocols.SIP_10)}
          >
            {Protocols.SIP_10}
          </Button>
          {/* To be uncommented when brc-20 tokens are supported */}
          {/* <Button
            isSelected={selectedProtocol === Protocols.BRC_20}
            onClick={() => setSelectedProtocol(Protocols.BRC_20)}
          >
            {Protocols.BRC_20}
          </Button> */}
        </FtInfoContainer>
        <TokenContainer>
          <Stacks />
          {coins?.map((coin, index) => (
            <CoinItem
              key={coin.contract} // contract is not optional and is unique
              coin={coin}
              disabled={false}
              toggled={toggled}
              enabled={coin.visible}
              showDivider={showDivider(index + 1)}
            />
          ))}
        </TokenContainer>
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default ManageTokens;
