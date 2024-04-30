import { BetterBarLoader } from '@components/barLoader';
import { StyledFiatAmountText } from '@components/fiatAmountText';
import TokenImage from '@components/tokenImage';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import { microstacksToStx, satsToBtc } from '@secretkeylabs/xverse-core';
import { StoreState } from '@stores/index';
import { CurrencyTypes } from '@utils/constants';
import { getFtBalance, getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const TileContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: props.color,
  width: '100%',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  paddingTop: props.theme.spacing(7.25),
  paddingBottom: props.theme.spacing(7.25),
  borderRadius: props.theme.radius(2),
  marginBottom: props.theme.spacing(0),
}));

const RowContainer = styled.div({
  flex: '1 0 auto',
  display: 'flex',
});

const TextContainer = styled.div((props) => ({
  marginLeft: props.theme.space.m,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const AmountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.space.xxs,
  overflow: 'hidden',
  alignItems: 'flex-end',
}));

const LoaderMainContainer = styled.div({
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const CoinTickerText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
}));

const SubText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  fontSize: 12,
  textAlign: 'left',
  maxWidth: 100,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const CoinBalanceText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
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
  loading: boolean;
  currency: CurrencyTypes;
  onPress: (coin: CurrencyTypes, ftKey: string | undefined) => void;
  fungibleToken?: FungibleToken;
  enlargeTicker?: boolean;
  className?: string;
  showProtocolIcon?: boolean;
}

function TokenTile({
  title,
  loading,
  currency,
  onPress,
  fungibleToken,
  enlargeTicker = false,
  className,
  showProtocolIcon = true,
}: Props) {
  const { fiatCurrency } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const { btcFiatRate, stxBtcRate } = useCoinRates();
  const { data: stxData } = useStxWalletData();
  const { data: btcBalance } = useBtcWalletData();

  function getTickerTitle() {
    if (currency === 'STX' || currency === 'BTC') return `${currency}`;
    return `${getFtTicker(fungibleToken as FungibleToken)}`;
  }

  function getBalanceAmount() {
    switch (currency) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxData?.balance ?? 0)).toString();
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance ?? 0)).toString();
      case 'FT':
        return fungibleToken ? getFtBalance(fungibleToken) : '';
      default:
    }
  }

  function getFiatEquivalent(): BigNumber | undefined {
    switch (currency) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxData?.balance ?? 0))
          .multipliedBy(stxBtcRate)
          .multipliedBy(btcFiatRate);
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance ?? 0)).multipliedBy(btcFiatRate);
      case 'FT':
        return fungibleToken?.tokenFiatRate
          ? new BigNumber(getFtBalance(fungibleToken)).multipliedBy(fungibleToken.tokenFiatRate)
          : undefined;
      default:
        return undefined;
    }
  }

  const handleTokenPressed = () => onPress(currency, fungibleToken?.principal);

  return (
    <TileContainer onClick={handleTokenPressed} className={className}>
      <RowContainer aria-label="Token Row">
        <TokenImage
          currency={currency}
          loading={loading}
          fungibleToken={fungibleToken}
          size={enlargeTicker ? 40 : 32}
          showProtocolIcon={showProtocolIcon}
        />
        <TextContainer>
          <CoinTickerText>{getTickerTitle()}</CoinTickerText>
          <TokenTitleContainer>
            <SubText aria-label="Token SubTitle">{title}</SubText>
          </TokenTitleContainer>
        </TextContainer>
      </RowContainer>
      {loading ? (
        <TokenLoader />
      ) : (
        <AmountContainer aria-label="CoinBalance Container">
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
