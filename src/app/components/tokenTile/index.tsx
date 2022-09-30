import { FungibleToken, getTicker } from '@utils/utils';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import { NumericFormat } from 'react-number-format';
import { CurrencyTypes, LoaderSize } from '@utils/constant';
import BarLoader from '@components/barLoader';
import { microstacksToStx, satsToBtc } from '@utils/walletUtils';
import { ftDecimals } from '@utils/helper';
import stc from 'string-to-color';

const TileContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  backgroundColor: props.color,
  paddingLeft: props.theme.spacing(9),
  paddingRight: props.theme.spacing(9),
  paddingTop: props.theme.spacing(9),
  paddingBottom: props.margin ?? props.theme.spacing(9),
  borderRadius: props.theme.radius(2),
  marginHorizontal: props.theme.spacing(7),
  marginBottom: props.theme.spacing(6),
}));

const TickerImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
  height: 32,
  width: 32,
}));

const TickerIconContainer = styled.div((props) => ({
  display:'flex',
  alignItems:'center',
  justifyContent:'center',
  height: 32,
  width: 32,
  marginRight: props.theme.spacing(3),
  borderRadius: props.theme.radius(2),
  backgroundColor: props.color,
}));

const TickerIconText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const TextContainer = styled.div((props) => ({
  flex: 1,
  marginLeft: props.theme.spacing(6),
}));

const AmountContainer = styled.div((props) => ({
  alignContent: 'flex-end',
}));

const CoinTickerText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textTransform: 'uppercase',
}));

const SubText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  fontSize: 12,
}));

const CoinBalanceText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
}));

interface Props {
  title: string;
  icon: string;
  underlayColor: string;
  margin?: number;
  currency?: CurrencyTypes;
  onPress?: (event: any) => void;
  stxBalance: BigNumber;
  btcBalance: BigNumber;
  stxBtcRate: BigNumber;
  btcFiatRate: BigNumber;
  loadingWalletData: boolean;
  initializedStxData: boolean;
  initializedFtData: boolean;
  initializedData: boolean;
  fungibleToken?: FungibleToken;
}
const TokenTile = ({
  icon,
  title,
  underlayColor,
  margin,
  currency,
  onPress,
  stxBalance,
  btcBalance,
  stxBtcRate,
  btcFiatRate,
  loadingWalletData,
  initializedStxData,
  initializedFtData,
  initializedData,
  fungibleToken,
}: Props) => {
  function getFtTicker() {
    if (fungibleToken?.ticker) {
      return fungibleToken.ticker.toUpperCase();
    } else if (fungibleToken?.name) {
      return getTicker(fungibleToken.name).toUpperCase();
    } else return '';
  }

  function getTickerTitle() {
    if (currency === 'STX' || currency === 'BTC') return `${currency}`;
    else return `${getFtTicker()}`;
  }

  function getBalance() {
    return currency === 'STX'
      ? renderStxBalanceView()
      : currency === 'BTC'
      ? renderBtcBalanceView()
      : renderFtBalanceView();
  }

  function getFtBalance(fungibleToken: FungibleToken) {
    if (fungibleToken.decimals) {
      return ftDecimals(fungibleToken.balance, fungibleToken.decimals);
    }
    return fungibleToken.balance;
  }

  function getBalanceAmount() {
    switch (currency) {
      case 'STX':
        return microstacksToStx(stxBalance).toString();
      case 'BTC':
        return satsToBtc(btcBalance).toString();
      case 'FT':
        return fungibleToken ? getFtBalance(fungibleToken) : '';
    }
  }

  function renderStxBalanceView() {
    if (!initializedStxData) {
      return <BarLoader loaderSize={LoaderSize.MEDIUM} />;
    } else {
      return (
        <NumericFormat
          value={getBalanceAmount()}
          displayType={'text'}
          thousandSeparator={true}
          renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
        />
      );
    }
  }

  function renderBtcBalanceView() {
    if (!initializedData) {
      return <BarLoader loaderSize={LoaderSize.MEDIUM} />;
    } else {
      return (
        <NumericFormat
          value={getBalanceAmount()}
          displayType={'text'}
          thousandSeparator={true}
          renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
        />
      );
    }
  }

  function renderFtBalanceView() {
    if (!initializedFtData) {
      return <BarLoader loaderSize={LoaderSize.MEDIUM} />;
    } else {
      return (
        <NumericFormat
          value={getBalanceAmount()}
          displayType={'text'}
          thousandSeparator={true}
          renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
        />
      );
    }
  }

  function getFtFiatEquivalent() {
    if (fungibleToken?.tokenFiatRate) {
      const balance = new BigNumber(getFtBalance(fungibleToken));
      const rate = new BigNumber(fungibleToken.tokenFiatRate);
      return balance.multipliedBy(rate).toFixed(2).toString();
    } else return '';
  }

  function getFiatEquivalent() {
    switch (currency) {
      case 'STX':
        return microstacksToStx(stxBalance)
          .multipliedBy(stxBtcRate)
          .multipliedBy(btcFiatRate)
          .toFixed(2)
          .toString();
      case 'BTC':
        return satsToBtc(btcBalance).multipliedBy(btcFiatRate).toFixed(2).toString();
      case 'FT':
        return getFtFiatEquivalent();
      default:
        return '';
    }
  }

  function renderFiatEquivalentView() {
    switch (currency) {
      case 'STX':
        if (!initializedStxData) {
          return <BarLoader loaderSize={LoaderSize.SMALL} />;
        } else {
          return (
            <NumericFormat
              value={getFiatEquivalent()}
              displayType={'text'}
              thousandSeparator={true}
              prefix={`${currencySymbolMap[fiatCurrency]} `}
              suffix={` ${fiatCurrency}`}
              renderText={(value) => <SubText>{value}</SubText>}
            />
          );
        }
      case 'BTC':
        if (!initializedData) {
          return <BarLoader loaderSize={LoaderSize.SMALL} />;
        } else {
          return (
            <NumericFormat
              value={getFiatEquivalent()}
              displayType={'text'}
              thousandSeparator={true}
              prefix={`${currencySymbolMap[fiatCurrency]} `}
              suffix={` ${fiatCurrency}`}
              renderText={(value) => <SubText>{value}</SubText>}
            />
          );
        }
      case 'FT':
        if (fungibleToken?.tokenFiatRate)
          return (
            <NumericFormat
              value={getFiatEquivalent()}
              displayType={'text'}
              thousandSeparator={true}
              prefix={`${currencySymbolMap[fiatCurrency]} `}
              suffix={` ${fiatCurrency}`}
              renderText={(value) => <SubText>{value}</SubText>}
            />
          );
    }
  }

  function renderFTIcon() {
    if (initializedFtData) {
      if (fungibleToken?.image) {
        return <TickerImage src={fungibleToken.image} />;
      } else {
        // render ticker icon
        let ticker = fungibleToken?.ticker;
        if (!ticker && fungibleToken?.name) {
          ticker = getTicker(fungibleToken?.name);
        }
        const background = stc(ticker);
        ticker = ticker && ticker.substring(0, 4);
        return (
          <TickerIconContainer color={background}>
            <TickerIconText>{ticker}</TickerIconText>
          </TickerIconContainer>
        );
      }
    } else {
      return <BarLoader loaderSize={LoaderSize.SMALLEST} />;
    }
  }
  function renderIcon() {
    if (currency === 'STX' || currency === 'BTC') return <TickerImage src={icon} />;
    else return renderFTIcon();
  }

  return (
    <TileContainer color={underlayColor} margin={margin} onClick={onPress}>
      {renderIcon()}
      <TextContainer>
        <CoinTickerText>{getTickerTitle()}</CoinTickerText>
        <SubText>{title}</SubText>
      </TextContainer>
      <AmountContainer>{getBalance()}</AmountContainer>
    </TileContainer>
  );
};

export default TokenTile;
