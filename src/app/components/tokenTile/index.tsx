import { BetterBarLoader } from '@components/barLoader';
import { StyledFiatAmountText } from '@components/fiatAmountText';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import { microstacksToStx, satsToBtc } from '@secretkeylabs/xverse-core';
import { StoreState } from '@stores/index';
import { CurrencyTypes } from '@utils/constants';
import { getTicker } from '@utils/helper';
import { getFtBalance, getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import { useSelector } from 'react-redux';
import stc from 'string-to-color';
import styled from 'styled-components';

interface TileProps {
  margin?: number;
  inModel: boolean;
}

interface TickerProps {
  enlargeTicker?: boolean;
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
  borderRadius: '50%',
}));

const TickerIconContainer = styled.div<TickerProps>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: props.enlargeTicker ? 40 : 32,
  width: props.enlargeTicker ? 40 : 32,
  marginRight: props.theme.spacing(3),
  borderRadius: '50%',
  backgroundColor: props.color,
}));

const TickerIconText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  wordBreak: 'break-all',
  fontSize: 10,
}));

const RowContainer = styled.div({
  flex: '1 0 auto',
  display: 'flex',
});

const TextContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const AmountContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const LoaderMainContainer = styled.div({
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const LoaderImageContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: props.theme.spacing(3),
}));

const CoinTickerText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
}));

const SubText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_400,
  fontSize: 12,
  textAlign: 'left',
  maxWidth: 100,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const CoinBalanceText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'end',
}));

const TokenTitleContainer = styled.div({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
});

const StyledBarLoader = styled(BetterBarLoader)<{
  withMarginBottom?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginBottom: props.withMarginBottom ? props.theme.spacing(2) : 0,
}));

function TokenLoader() {
  return (
    <LoaderMainContainer>
      <StyledBarLoader width={80} height={16} withMarginBottom />
      <StyledBarLoader width={70} height={14} />
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
    brc20Ft?: string | undefined;
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
  const { fiatCurrency, stxBalance, btcBalance, stxBtcRate, btcFiatRate } = useSelector(
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
      case 'brc20':
        return fungibleToken ? getFtBalance(fungibleToken) : '';
      default:
    }
  }

  function getFiatEquivalent(): BigNumber | undefined {
    switch (currency) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxBalance))
          .multipliedBy(stxBtcRate)
          .multipliedBy(btcFiatRate);
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance)).multipliedBy(btcFiatRate);
      case 'FT':
      case 'brc20':
        return fungibleToken?.tokenFiatRate
          ? new BigNumber(getFtBalance(fungibleToken)).multipliedBy(fungibleToken.tokenFiatRate)
          : undefined;
      default:
        return undefined;
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
        <StyledBarLoader width={enlargeTicker ? 40 : 32} height={enlargeTicker ? 40 : 32} />
      </LoaderImageContainer>
    );
  }

  function renderIcon() {
    if (currency === 'STX' || currency === 'BTC')
      return <TickerImage src={icon} enlargeTicker={enlargeTicker} />;
    return renderFTIcon();
  }

  const handleTokenPressed = () => {
    onPress({
      coin: currency as CurrencyTypes,
      ft: fungibleToken && fungibleToken.principal,
      brc20Ft: currency === 'brc20' ? fungibleToken?.principal : undefined,
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
          </TokenTitleContainer>
        </TextContainer>
      </RowContainer>
      {loading ? (
        <TokenLoader />
      ) : (
        <AmountContainer>
          <NumericFormat
            value={getBalanceAmount()}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
          />
          <StyledFiatAmountText fiatAmount={getFiatEquivalent()} fiatCurrency={fiatCurrency} />
        </AmountContainer>
      )}
    </TileContainer>
  );
}

export default TokenTile;
