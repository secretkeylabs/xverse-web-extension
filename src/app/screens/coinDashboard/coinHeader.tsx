import ActionButton from '@components/button';
import TokenImage from '@components/tokenImage';
import CreditCard from '@assets/img/dashboard/credit_card.svg';
import ArrowDownLeft from '@assets/img/dashboard/arrow_down_left.svg';
import ArrowUpRight from '@assets/img/dashboard/arrow_up_right.svg';
import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken, microstacksToStx, satsToBtc } from '@secretkeylabs/xverse-core';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import { CurrencyTypes } from '@utils/constants';
import { getFtBalance, getFtTicker } from '@utils/tokens';
import { useNavigate } from 'react-router-dom';

interface CoinBalanceProps {
  coin: CurrencyTypes;
  fungibleToken?: FungibleToken;
}

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const BalanceInfoContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const BalanceValuesContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
}));

const CoinBalanceText = styled.h1((props) => ({
  ...props.theme.headline_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  fontSize: 12,
  marginTop: props.theme.spacing(2),
  textAlign: 'center',
}));

const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(11),
}));

const ButtonContainer = styled.div({
  flex: 0.31,
});

export default function CoinHeader(props: CoinBalanceProps) {
  const {
    coin,
    fungibleToken,
  } = props;
  const {
    btcBalance,
    stxBalance,
    fiatCurrency,
    stxBtcRate,
    btcFiatRate,
  } = useWalletSelector();
  const navigate = useNavigate();

  function getBalanceAmount() {
    switch (coin) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxBalance)).toString();
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance)).toString();
      default:
        return fungibleToken ? getFtBalance(fungibleToken) : '';
    }
  }

  function getFtFiatEquivalent() {
    if (fungibleToken?.tokenFiatRate) {
      const balance = new BigNumber(getFtBalance(fungibleToken));
      const rate = new BigNumber(fungibleToken.tokenFiatRate);
      return balance.multipliedBy(rate).toFixed(2).toString();
    }
    return '';
  }

  const getTokenTicker = () => {
    if (coin === 'STX' || coin === 'BTC') {
      return coin;
    }
    if (coin === 'FT' && fungibleToken) {
      return getFtTicker(fungibleToken);
    }
    return '';
  };

  function getFiatEquivalent() {
    switch (coin) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxBalance))
          .multipliedBy(new BigNumber(stxBtcRate))
          .multipliedBy(new BigNumber(btcFiatRate))
          .toFixed(2)
          .toString();
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance))
          .multipliedBy(new BigNumber(btcFiatRate))
          .toFixed(2)
          .toString();
      case 'FT':
        return getFtFiatEquivalent();
      default:
        return '';
    }
  }
  return (
    <Container>
      <BalanceInfoContainer>
        <TokenImage
          token={coin || undefined}
          loading={false}
          fungibleToken={fungibleToken || undefined}
        />
        <BalanceValuesContainer>
          <NumericFormat
            value={getBalanceAmount()}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => (
              <CoinBalanceText>{`${value} ${getTokenTicker()}`}</CoinBalanceText>
            )}
          />
          <NumericFormat
            value={getFiatEquivalent()}
            displayType="text"
            thousandSeparator
            prefix={`${currencySymbolMap[fiatCurrency]} `}
            suffix={` ${fiatCurrency}`}
            renderText={(value) => <FiatAmountText>{value}</FiatAmountText>}
          />
        </BalanceValuesContainer>
      </BalanceInfoContainer>
      <RowButtonContainer>
        <ButtonContainer>
          <ActionButton src={ArrowUpRight} text="Send" onPress={() => navigate(`/send-${coin}`)} />
        </ButtonContainer>
        <ButtonContainer>
          <ActionButton
            src={ArrowDownLeft}
            text="Receive"
            onPress={() => navigate(`/receive/${coin}`)}
          />
        </ButtonContainer>
        <ButtonContainer>
          <ActionButton src={CreditCard} text="Buy" onPress={() => null} />
        </ButtonContainer>
      </RowButtonContainer>
    </Container>
  );
}
