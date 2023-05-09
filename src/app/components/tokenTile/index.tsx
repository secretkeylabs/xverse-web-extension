import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import { NumericFormat } from 'react-number-format';
import { CurrencyTypes, LoaderSize } from '@utils/constants';
import BarLoader from '@components/barLoader';
import { getTicker } from '@utils/helper';
import stc from 'string-to-color';
import { FungibleToken } from '@secretkeylabs/xverse-core/types';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import { StoreState } from '@stores/index';
import { useSelector } from 'react-redux';
import { microstacksToStx, satsToBtc } from '@secretkeylabs/xverse-core/currency';
import { getFtBalance, getFtTicker } from '@utils/tokens';

interface TileProps {
  margin?: number;
  inModel: boolean;
}

interface TickerProps {
  enlargeTicker? : boolean;
}
const TileContainer = styled.button<TileProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: props.color,
  width: '100%',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  paddingTop: props.theme.spacing(7.25),
  paddingBottom: props.margin ?? props.theme.spacing(7.25),
  borderRadius: props.theme.radius(2),
  marginBottom: props.inModel ? props.theme.spacing(0) : props.theme.spacing(6),
}));

const TickerImage = styled.img<TickerProps>((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
  height: props.enlargeTicker ? 40 : 32,
  width: props.enlargeTicker ? 40 : 32,
}));

const TickerIconContainer = styled.div<TickerProps>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: props.enlargeTicker ? 40 : 32,
  width: props.enlargeTicker ? 40 : 32,
  marginRight: props.theme.spacing(3),
  borderRadius: props.theme.radius(2),
  backgroundColor: props.color,
}));

const TickerIconText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  wordBreak: 'break-all',
  fontSize: 10,
}));

const RowContainer = styled.div({
  flex: 1,
  display: 'flex',
});

const TextContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const AmountContainer = styled.div({
  alignContent: 'flex-end',
});

const LoaderMainContainer = styled.div((props) => ({
  flex: 1,
  maxWidth: 200,
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  marginLeft: props.theme.spacing(15),
}));

const LoaderImageContainer = styled.div({
  flex: 0.5,
  maxWidth: 40,
});

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

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  fontSize: 12,
  textAlign: 'end',
}));

const CoinBalanceText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  textAlign: 'end',
}));

const TokenTitleContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const ProtocolText = styled.p((props) => ({
  ...props.theme.headline_category_s,
  fontWeight: '700',
  textTransform: 'uppercase',
  marginLeft: props.theme.spacing(5),
  backgroundColor: props.theme.colors.white['400'],
  padding: '2px 6px 1px',
  borderRadius: props.theme.radius(2),
}));

function TokenLoader() {
  return (
    <LoaderMainContainer>
      <BarLoader loaderSize={LoaderSize.LARGE} />
      <BarLoader loaderSize={LoaderSize.MEDIUM} />
    </LoaderMainContainer>
  );
}
interface Props {
  title: string;
  icon?: string;
  underlayColor: string;
  loading: boolean;
  margin?: number;
  currency?: CurrencyTypes;
  onPress: (token: {
    coin: CurrencyTypes;
    ft: string | undefined;
  }) => void;
  fungibleToken?: FungibleToken;
  enlargeTicker?: boolean;
}

function TokenTile({
  icon,
  title,
  underlayColor,
  loading,
  margin,
  currency,
  onPress,
  fungibleToken,
  enlargeTicker = false,
}: Props) {
  const {
    fiatCurrency, stxBalance, btcBalance, stxBtcRate, btcFiatRate,
  } = useSelector(
    (state: StoreState) => state.walletState,
  );

  function getTickerTitle() {
    if (currency === 'STX' || currency === 'BTC') return `${currency}`;
    return `${getFtTicker(fungibleToken as FungibleToken)}`;
  }

  function getBalanceAmount() {
    switch (currency) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxBalance)).toString();
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance)).toString();
      case 'FT':
        return fungibleToken ? getFtBalance(fungibleToken) : '';
      default:
    }
  }

  const renderStxBalanceView = (
    <NumericFormat
      value={getBalanceAmount()}
      displayType="text"
      thousandSeparator
      renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
    />
  );

  const renderBtcBalanceView = (
    <NumericFormat
      value={getBalanceAmount()}
      displayType="text"
      thousandSeparator
      renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
    />
  );

  const renderFtBalanceView = (
    <NumericFormat
      value={getBalanceAmount()}
      displayType="text"
      thousandSeparator
      renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
    />
  );

  function getBalance() {
    if (currency === 'STX') return renderStxBalanceView;
    if (currency === 'BTC') return renderBtcBalanceView;
    return renderFtBalanceView;
  }

  function getFtFiatEquivalent() {
    if (fungibleToken?.tokenFiatRate) {
      const balance = new BigNumber(getFtBalance(fungibleToken));
      const rate = new BigNumber(fungibleToken.tokenFiatRate);
      return balance.multipliedBy(rate).toFixed(2).toString();
    }
    return '';
  }

  function getFiatEquivalent() {
    switch (currency) {
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

  function renderFiatEquivalentView() {
    switch (currency) {
      case 'STX':
        return (
          <NumericFormat
            value={getFiatEquivalent()}
            displayType="text"
            thousandSeparator
            prefix={`${currencySymbolMap[fiatCurrency]} `}
            suffix={` ${fiatCurrency}`}
            renderText={(value) => <FiatAmountText>{value}</FiatAmountText>}
          />
        );
      case 'BTC':
        return (
          <NumericFormat
            value={getFiatEquivalent()}
            displayType="text"
            thousandSeparator
            prefix={`${currencySymbolMap[fiatCurrency]} `}
            suffix={` ${fiatCurrency}`}
            renderText={(value) => <FiatAmountText>{value}</FiatAmountText>}
          />
        );
      case 'FT':
        if (fungibleToken?.tokenFiatRate) {
          return (
            <NumericFormat
              value={getFiatEquivalent()}
              displayType="text"
              thousandSeparator
              prefix={`${currencySymbolMap[fiatCurrency]} `}
              suffix={` ${fiatCurrency}`}
              renderText={(value) => <FiatAmountText>{value}</FiatAmountText>}
            />
          );
        }
        break;
      default:
    }
  }

  function renderFTIcon() {
    if (!loading) {
      if (fungibleToken?.image) {
        return <TickerImage src={fungibleToken.image} enlargeTicker={enlargeTicker} />;
      }
      // render ticker icon
      let ticker = fungibleToken?.ticker;
      if (!ticker && fungibleToken?.name) {
        ticker = getTicker(fungibleToken?.name);
      }
      const background = stc(ticker);
      ticker = ticker && ticker.substring(0, 4);
      return (
        <TickerIconContainer color={background} enlargeTicker={enlargeTicker}>
          <TickerIconText>{ticker}</TickerIconText>
        </TickerIconContainer>
      );
    }
    return (
      <LoaderImageContainer>
        <BarLoader loaderSize={LoaderSize.LARGE} />
      </LoaderImageContainer>
    );
  }

  function renderIcon() {
    if (currency === 'STX' || currency === 'BTC') return <TickerImage src={icon} enlargeTicker={enlargeTicker} />;
    return renderFTIcon();
  }

  const handleTokenPressed = () => {
    onPress({
      coin: currency as CurrencyTypes,
      ft: fungibleToken && fungibleToken.principal,
    });
  };

  return (
    <TileContainer
      inModel={enlargeTicker}
      color={underlayColor}
      margin={margin}
      onClick={handleTokenPressed}
    >
      <RowContainer>
        {renderIcon()}
        <TextContainer>

          <CoinTickerText>{getTickerTitle()}</CoinTickerText>
          <TokenTitleContainer>
            <SubText>{title}</SubText>
            {
              fungibleToken?.protocol ? (
                <ProtocolText>
                  {fungibleToken?.protocol === 'stacks' ? 'Sip-10' : fungibleToken?.protocol}
                </ProtocolText>
              ) : null
            }
          </TokenTitleContainer>
        </TextContainer>
      </RowContainer>
      {loading ? (
        <TokenLoader />
      ) : (
        <AmountContainer>
          {getBalance()}
          {renderFiatEquivalentView()}
        </AmountContainer>
      )}
    </TileContainer>
  );
}

export default TokenTile;
