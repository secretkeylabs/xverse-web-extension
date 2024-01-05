import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import TopRow from '@components/topRow';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import CoinItem from '@screens/manageTokens/coinItem';
import { Coin, FungibleToken } from '@secretkeylabs/xverse-core';
import { StoreState } from '@stores/index';
import { FetchUpdatedVisibleCoinListAction } from '@stores/wallet/actions/actionCreators';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const TokenContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 22px;
  padding-right: 22px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

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
      disabled={hideStx}
      toggled={toggleStxVisibility}
      enabled={!hideStx}
      showDivider
    />
  );
}

function ManageTokens() {
  const { t } = useTranslation('translation', { keyPrefix: 'TOKEN_SCREEN' });
  const { coinsList, coins } = useSelector((state: StoreState) => state.walletState);
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
    <Container>
      <TopRow title={t('ADD_COINS')} onClick={handleBackButtonClick} />
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
  );
}

export default ManageTokens;
