import { BetterBarLoader } from '@components/barLoader';
import { StyledFiatAmountText } from '@components/fiatAmountText';
import PercentageChange from '@components/percentageChange';
import TokenImage from '@components/tokenImage';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { getFiatEquivalent, type FungibleToken } from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';
import { getBalanceAmount, getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const TileContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: props.color,
  width: '100%',
  padding: `${props.theme.space.m} 0`,
  borderRadius: props.theme.radius(2),
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

const SubText = styled.p<{ fullWidth: boolean }>((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.white_200,
  textAlign: 'left',
  maxWidth: props.fullWidth ? 'unset' : 120,
  whiteSpace: props.fullWidth ? 'normal' : 'nowrap',
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
  marginBottom: props.withMarginBottom ? props.theme.space.xxs : 0,
}));

const FiatCurrencyRow = styled.div({
  display: 'flex',
  alignItems: 'center',
});

function TokenLoader() {
  return (
    <LoaderMainContainer>
      <StyledBarLoader width={80} height={16} withMarginBottom />
      <StyledBarLoader width={70} height={14} />
    </LoaderMainContainer>
  );
}

type Props = {
  title: string;
  loading?: boolean;
  currency: CurrencyTypes;
  onPress: (coin: CurrencyTypes, fungibleToken: FungibleToken | undefined) => void;
  fungibleToken?: FungibleToken;
  enlargeTicker?: boolean;
  className?: string;
  showProtocolIcon?: boolean;
  hideBalance?: boolean;
};

function TokenTile({
  title,
  loading = false,
  currency,
  onPress,
  fungibleToken,
  enlargeTicker = false,
  className,
  showProtocolIcon = true,
  hideBalance = false,
}: Props) {
  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { data: stxData } = useStxWalletData();
  const { data: btcBalance } = useBtcWalletData();

  const getTickerTitle = () => {
    if (currency === 'STX' || currency === 'BTC') return `${currency}`;
    return `${getFtTicker(fungibleToken as FungibleToken)}`;
  };

  const handleTokenPressed = () => onPress(currency, fungibleToken);

  const getFiatAmount = () => {
    const fiatAmount = getFiatEquivalent(
      Number(getBalanceAmount(currency, fungibleToken, stxData, btcBalance)),
      currency,
      BigNumber(stxBtcRate),
      BigNumber(btcFiatRate),
      fungibleToken,
    );
    if (fiatAmount) {
      return BigNumber(fiatAmount);
    }
    return undefined;
  };

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
            <SubText aria-label="Token SubTitle" fullWidth={hideBalance}>
              {title}
            </SubText>
          </TokenTitleContainer>
        </TextContainer>
      </RowContainer>
      {loading ? (
        <TokenLoader />
      ) : (
        !hideBalance && (
          <AmountContainer aria-label="CoinBalance Container">
            <NumericFormat
              value={getBalanceAmount(currency, fungibleToken, stxData, btcBalance)}
              displayType="text"
              thousandSeparator
              renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
            />
            <FiatCurrencyRow>
              <PercentageChange ftCurrencyPairs={[[fungibleToken, currency]]} />
              <StyledFiatAmountText fiatAmount={getFiatAmount()} fiatCurrency={fiatCurrency} />
            </FiatCurrencyRow>
          </AmountContainer>
        )
      )}
    </TileContainer>
  );
}

export default TokenTile;
